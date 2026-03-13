import { ApiProperty } from '@nestjs/swagger';

class WebhookDataDto {
  @ApiProperty({
    example: '123456789',
    description: 'ID del pago en Mercado Pago',
  })
  id: string;
}

export class MercadoPagoWebhookDto {
  @ApiProperty({ example: 'payment', description: 'Tipo de evento' })
  type?: string;

  @ApiProperty({ type: WebhookDataDto })
  data?: WebhookDataDto;

  @ApiProperty({
    example: 'https://api.mercadopago.com/v1/payments/123456789',
    required: false,
  })
  resource?: string;
}

export class PaymentWebhookResponseDto {
  @ApiProperty({ example: true })
  success?: boolean;

  @ApiProperty({ example: true })
  received?: boolean;
}
