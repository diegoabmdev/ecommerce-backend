import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, Max, MinLength, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Calificación del producto (1 a 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Comentario detallado sobre la experiencia con el producto',
    example: 'Es un producto de excelente calidad, superó mis expectativas.',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  comment: string;

  @ApiProperty({
    description: 'ID único (UUID) del producto a calificar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  productId: string;
}
