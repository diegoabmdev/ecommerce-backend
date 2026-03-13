import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: '¿Cuántos elementos quieres por página?',
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    default: 0,
    description: '¿Cuántos elementos quieres saltar? (Paginación)',
    required: false,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiProperty({
    description: 'Término de búsqueda (título del producto)',
    required: false,
    example: 'silla',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtrar por ID de categoría',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
