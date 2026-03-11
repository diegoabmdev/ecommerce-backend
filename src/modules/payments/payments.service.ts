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
          //auto_return: 'approved',
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
}
