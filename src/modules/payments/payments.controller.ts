import {
  Controller,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

import { ApiServerErrors } from '../../common/decorators/swagger-errors.decorator';
import {
  MercadoPagoWebhookDto,
  PaymentWebhookResponseDto,
} from 'src/common/responses/payment-responses.dto';

@ApiTags('Payments')
@ApiServerErrors()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook de Mercado Pago',
    description:
      'Recibe notificaciones automáticas de pagos aprobados. Actualiza el estado de la orden a PAID.',
  })
  @ApiQuery({ name: 'topic', required: false, example: 'payment' })
  @ApiBody({ type: MercadoPagoWebhookDto })
  @ApiResponse({
    status: 200,
    description: 'Notificación procesada',
    type: PaymentWebhookResponseDto,
  })
  async handleWebhook(
    @Query('topic') topic: string | undefined,
    @Body() body: MercadoPagoWebhookDto,
  ) {
    if (topic === 'payment' || body.type === 'payment') {
      const paymentId = body.data?.id || body.resource?.split('/').pop();

      if (paymentId) {
        return await this.paymentsService.verifyPayment(paymentId);
      }
    }
    return { received: true };
  }
}
