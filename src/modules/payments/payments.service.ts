import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

import { Order, OrderStatus } from '../orders/entities/order.entity';
import { MercadoPagoWebhookDto } from 'src/common/responses/payment-responses.dto';

interface PaymentItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
}

@Injectable()
export class PaymentsService {
  private readonly client: MercadoPagoConfig;
  private readonly logger = new Logger('PaymentsService');

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    // getOrThrow asegura que si falta la variable, la app lance un error al iniciar
    const accessToken =
      this.configService.getOrThrow<string>('MP_ACCESS_TOKEN');

    this.client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 },
    });
  }

  /**
   * Genera una preferencia de pago en la pasarela de Mercado Pago.
   */
  async createPreference(
    orderId: string,
    items: PaymentItem[],
  ): Promise<PreferenceResponse> {
    try {
      const preference = new Preference(this.client);
      const webhookUrl = this.configService.get<string>('BASE_URL_WEBHOOK');
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      return await preference.create({
        body: {
          items: items.map((item) => ({
            id: item.productId,
            title: item.title,
            quantity: item.quantity,
            unit_price: Math.round(Number(item.price)),
            currency_id: 'CLP',
          })),
          back_urls: {
            success: `${frontendUrl}/checkout/success`,
            failure: `${frontendUrl}/checkout/failure`,
          },
          auto_return: 'approved',
          external_reference: orderId,
          notification_url: `${webhookUrl}/api/v1/payments/webhook`,
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Error al crear preferencia MP para orden ${orderId}: ${message}`,
      );
      throw new InternalServerErrorException(
        'No se pudo generar el enlace de pago',
      );
    }
  }

  /**
   * Orquestador principal del Webhook.
   */
  async processWebhook(topic: string | undefined, body: MercadoPagoWebhookDto) {
    // Verificamos si la notificación es de tipo 'payment'
    const isPaymentEvent = topic === 'payment' || body.type === 'payment';
    const paymentId = body.data?.id || body.resource?.split('/').pop();

    if (isPaymentEvent && paymentId) {
      return await this.verifyPayment(paymentId);
    }

    return { received: true };
  }

  /**
   * Valida el estado del pago directamente con la API de Mercado Pago
   */
  async verifyPayment(paymentId: string) {
    try {
      const payment = new Payment(this.client);
      const paymentData = await payment.get({ id: paymentId });

      const orderId = paymentData.external_reference;
      const isApproved = paymentData.status === 'approved';

      if (isApproved && orderId) {
        await this.handleOrderSuccess(orderId);
      }

      return { success: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error verificando pago ${paymentId}: ${message}`);
      // Retornamos success: false para que el webhook sepa que hubo un error interno
      return { success: false };
    }
  }

  /**
   * Actualiza la base de datos y dispara procesos asíncronos (n8n).
   * Principio de Responsabilidad Única (SRP).
   */
  private async handleOrderSuccess(orderId: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      this.logger.warn(`Pago aprobado para orden inexistente: ${orderId}`);
      return;
    }

    if (order.status === OrderStatus.PAID) return;

    // Actualización de estado en DB
    await this.orderRepository.update(orderId, { status: OrderStatus.PAID });
    this.logger.log(`Orden ${orderId} marcada como PAGADA`);

    // Disparar n8n sin bloquear el flujo principal
    this.triggerN8nAutomation(order).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      this.logger.error(
        `Fallo en automatización n8n para orden ${orderId}: ${message}`,
      );
    });
  }

  /**
   * Comunicación externa con el flujo de n8n.
   */
  private async triggerN8nAutomation(order: Order): Promise<void> {
    const n8nUrl = this.configService.get<string>('N8N_WEBHOOK_URL');
    if (!n8nUrl) return;

    const payload = {
      event: 'order.paid',
      timestamp: new Date().toISOString(),
      order: {
        id: order.id,
        total: order.total,
        customer: { email: order.user.email },
        items: order.items.map((i) => ({
          name: i.product.title,
          qty: i.quantity,
          price: i.priceAtPurchase,
        })),
      },
    };

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
  }
}
