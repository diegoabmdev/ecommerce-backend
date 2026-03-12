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
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  title: string;

  @IsNumber()
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsInt()
  @Min(0, { message: 'El stock no puede ser menor a 0' })
  @IsOptional()
  stock?: number;

  @IsObject()
  @IsOptional()
  specifications?: Record<string, string | number>;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsObject()
  @IsOptional()
  dimensions?: { width: number; height: number; depth: number };

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
