import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsInt, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ example: 4.8, required: false })
  @IsNumber()
  @IsOptional()
  ratingAverage?: number;

  @ApiProperty({ example: 120, required: false })
  @IsInt()
  @IsOptional()
  reviewCount?: number;
}
