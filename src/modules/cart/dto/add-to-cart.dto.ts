import { IsUUID, IsInt, IsPositive, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    example: '436cd5b2-c14e-495f-9e7a-6defb882a1de',
    description: 'ID del producto que se desea añadir (UUID)',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: 1,
    description: 'Cantidad de unidades a añadir al carrito',
    default: 1,
    required: false,
  })
  @Min(1)
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number = 1;
}
