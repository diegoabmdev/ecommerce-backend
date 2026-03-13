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
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Teclado Mecánico RGB',
    description: 'Nombre del producto',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  title: string;

  @ApiProperty({
    example: 85.5,
    description: 'Precio de venta',
    minimum: 1,
  })
  @IsNumber()
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  price: number;

  @ApiProperty({
    example: 'Teclado con switches red y retroiluminación personalizable.',
    description: 'Descripción detallada del producto',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'teclado-mecanico-rgb',
    description: 'URL amigable. Se autogenera si se deja vacío.',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: 100,
    description: 'Cantidad inicial en stock',
    required: false,
    default: 0,
  })
  @IsInt()
  @Min(0, { message: 'El stock no puede ser menor a 0' })
  @IsOptional()
  stock?: number;

  @ApiProperty({
    example: { switch: 'Red', layout: 'ISO', hotswap: true },
    description: 'Especificaciones técnicas en formato JSON',
    required: false,
  })
  @IsObject()
  @IsOptional()
  specifications?: Record<string, string | number>;

  @ApiProperty({
    example: [
      'https://link-a-imagen.com/1.jpg',
      'https://link-a-imagen.com/2.jpg',
    ],
    description: 'Lista de URLs de imágenes (normalmente se maneja vía upload)',
    required: false,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({
    example: 1.2,
    description: 'Peso del producto en kilogramos',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiProperty({
    example: { width: 45, height: 15, depth: 4 },
    description: 'Dimensiones del producto (Ancho, Alto, Profundidad)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  dimensions?: { width: number; height: number; depth: number };

  @ApiProperty({
    example: true,
    description: 'Estado de visibilidad del producto',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: ['gaming', 'setup', 'pc'],
    description: 'Etiquetas para búsqueda y filtrado',
    required: false,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID de la categoría relacionada',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
