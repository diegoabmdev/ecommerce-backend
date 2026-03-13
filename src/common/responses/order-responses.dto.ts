import { ApiProperty } from '@nestjs/swagger';

export class OrderCreatedDataDto {
  @ApiProperty({ example: 'Orden creada exitosamente' })
  message: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  orderId: string;

  @ApiProperty({
    example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...',
    description: 'URL para redirigir al usuario al portal de pagos',
  })
  checkoutUrl: string;
}
