import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface PaymentItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
}

interface N8nOrderPayload {
  event: string;
  date: string;
  order: {
    id: string;
    total: number;
    tax: number;
    status: OrderStatus;
    user: {
      id: string;
      email: string;
    };
    items: {
      title: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[];
  };
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
    const token = this.configService.get<string>('MP_ACCESS_TOKEN');

    if (!token) {
      this.logger.error(
        'MP_ACCESS_TOKEN no encontrado en las variables de entorno',
      );
    }

    this.client = new MercadoPagoConfig({
      accessToken: token || '',
      options: { timeout: 5000 },
    });
  }

  async createPreference(
    orderId: string,
    items: PaymentItem[],
  ): Promise<PreferenceResponse> {
    try {
      const preference = new Preference(this.client);

      const response = await preference.create({
        body: {
          items: items.map((item) => ({
            id: item.productId,
            title: item.title,
            quantity: item.quantity,
            unit_price: Math.round(Number(item.price)),
            currency_id: 'CLP',
          })),
          back_urls: {
            success: 'https://www.google.com',
            failure: 'https://www.google.com',
            pending: 'https://www.google.com',
          },
          external_reference: String(orderId),
          notification_url: `${this.configService.get<string>('BASE_URL_WEBHOOK')}/api/v1/payments/webhook`,
        },
      });

      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error en Mercado Pago: ${errorMessage}`);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async verifyPayment(paymentId: string) {
    try {
      const payment = new Payment(this.client);
      const paymentData = await payment.get({ id: paymentId });

      const orderId = paymentData.external_reference;

      if (paymentData.status === 'approved' && orderId) {
        await this.orderRepository.update(orderId, {
          status: OrderStatus.PAID,
        });

        this.logger.log(`Orden ${orderId} pagada exitosamente.`);

        const fullOrder = await this.orderRepository.findOne({
          where: { id: orderId },
          relations: ['user', 'items', 'items.product'],
        });

        if (fullOrder) {
          this.triggerN8nWebhook(fullOrder).catch((err: unknown) => {
            const msg =
              err instanceof Error ? err.message : 'Error desconocido';
            this.logger.error(`Error disparando n8n: ${msg}`);
          });
        }
      } else if (!orderId) {
        this.logger.warn(
          `El pago ${paymentId} no tiene external_reference (orderId)`,
        );
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error al verificar pago: ${errorMessage}`);
      return { success: false };
    }
  }

  private async triggerN8nWebhook(order: Order) {
    const n8nUrl = this.configService.get<string>('N8N_WEBHOOK_URL');

    if (!n8nUrl) {
      this.logger.warn(
        'N8N_WEBHOOK_URL no configurada, saltando automatización.',
      );
      return;
    }

    try {
      const payload: N8nOrderPayload = {
        event: 'order.paid',
        date: new Date().toISOString(),
        order: {
          id: order.id,
          total: order.total,
          tax: order.tax,
          status: order.status,
          user: {
            id: order.user.id,
            email: order.user.email,
          },
          items: order.items.map((item) => ({
            title: item.product.title,
            quantity: item.quantity,
            price: item.priceAtPurchase,
            subtotal: item.quantity * item.priceAtPurchase,
          })),
        },
      };

      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      this.logger.log('Notificación enviada a n8n correctamente.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Falló el envío a n8n: ${msg}`);
    }
  }
}
