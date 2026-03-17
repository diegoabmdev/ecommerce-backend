import { ApiProperty } from '@nestjs/swagger';

class CartItemDetailDto {
  @ApiProperty({ example: '436cd5b2-c14e-495f-9e7a-6defb882a1de' })
  productId: string;

  @ApiProperty({ example: 'Silla Herman Miller Embody' })
  title: string;

  @ApiProperty({ example: 1800 })
  price: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 1800 })
  itemTotal: number;
}

class CartSummaryDto {
  @ApiProperty({ example: 1 })
  totalItems: number;

  @ApiProperty({ example: 1800 })
  subtotal: number;

  @ApiProperty({ example: 342 })
  tax: number;

  @ApiProperty({ example: 2142 })
  total: number;
}

export class CartResponseDto {
  @ApiProperty({
    type: [CartItemDetailDto],
    example: {
      productId: '436cd5b2-c14e-495f-9e7a-6defb882a1de',
      title: 'Silla Herman Miller Embody',
      price: 1800,
      quantity: 1,
      itemTotal: 1800,
    },
  })
  items: CartItemDetailDto[];

  @ApiProperty({
    type: CartSummaryDto,
    example: {
      totalItems: 1,
      subtotal: 1800,
      tax: 342,
    },
  })
  summary: CartSummaryDto;
}

export class CartUpdateDto {
  @ApiProperty({
    type: [CartItemDetailDto],
    example: {
      productId: '436cd5b2-c14e-495f-9e7a-6defb882a1de',
      title: 'Silla Herman Miller Embody',
      price: 1800,
      quantity: 1,
      itemTotal: 1800,
    },
  })
  items: CartItemDetailDto[];
}
