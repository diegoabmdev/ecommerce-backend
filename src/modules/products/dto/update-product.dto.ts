import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsNumber()
  @IsOptional()
  ratingAverage?: number;

  @IsInt()
  @IsOptional()
  reviewCount?: number;
}
