import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartQuantityDto {
  @ApiProperty({
    example: 5,
    description: 'Nueva cantidad total para el producto (0 para eliminar)',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;
}
