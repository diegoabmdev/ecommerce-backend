import {
  Controller,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

import { ApiServerErrors } from '../../common/decorators/swagger-errors.decorator';
import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';
import {
  MercadoPagoWebhookDto,
  PaymentWebhookResponseDto,
} from '../../common/responses/payment-responses.dto';

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
      'Recibe notificaciones automáticas de pagos para actualizar el estado de las órdenes.',
  })
  @ApiQuery({ name: 'topic', required: false, example: 'payment' })
  @ApiBaseResponse(
    PaymentWebhookResponseDto,
    'Notificación procesada correctamente',
    HttpStatus.OK,
  )
  async handleWebhook(
    @Query('topic') topic: string | undefined,
    @Body() body: MercadoPagoWebhookDto,
  ) {
    return await this.paymentsService.processWebhook(topic, body);
  }
}
