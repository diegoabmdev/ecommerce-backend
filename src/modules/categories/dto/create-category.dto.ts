// src/categories/dto/create-category.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre único de la categoría',
    example: 'Electrónica',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Breve descripción de lo que incluye la categoría',
    example: 'Dispositivos, gadgets y accesorios tecnológicos',
    required: false,
  })
  @IsString()
  description?: string;
}
