import { IsInt, IsString, Min, Max, MinLength, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(10, {
    message: 'El comentario debe ser más descriptivo (min 10 caracteres)',
  })
  comment: string;

  @IsUUID()
  productId: string;
}
