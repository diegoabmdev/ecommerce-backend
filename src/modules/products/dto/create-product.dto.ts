import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsArray,
  IsBoolean,
  Min,
  IsPositive,
  MinLength,
  IsObject,
  IsUUID,
  Max,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Teclado Mecánico RGB', minLength: 3 })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 85.5, description: 'Precio base' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    example: 10.5,
    description: 'Porcentaje de descuento',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercentage?: number;

  @ApiProperty({ example: 'Descripción del producto', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'teclado-mecanico-rgb', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Logitech', required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ example: 'LOGI-99-X', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 100, required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: 'In Stock', required: false })
  @IsString()
  @IsOptional()
  availabilityStatus?: string;

  @ApiProperty({ example: { switch: 'Red' }, required: false })
  @IsObject()
  @IsOptional()
  specifications?: Record<string, string | number>;

  @ApiProperty({ example: ['https://link.com/1.jpg'], required: false })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: 1.2, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiProperty({
    example: { width: 45, height: 15, depth: 4 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  dimensions?: { width: number; height: number; depth: number };

  @ApiProperty({ example: '2 years warranty', required: false })
  @IsString()
  @IsOptional()
  warrantyInformation?: string;

  @ApiProperty({ example: 'Ships in 24h', required: false })
  @IsString()
  @IsOptional()
  shippingInformation?: string;

  @ApiProperty({ example: '30 days return policy', required: false })
  @IsString()
  @IsOptional()
  returnPolicy?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsPositive()
  @IsOptional()
  minimumOrderQuantity?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: ['gaming', 'setup'], isArray: true, required: false })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 'UUID-DE-CATEGORIA', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
