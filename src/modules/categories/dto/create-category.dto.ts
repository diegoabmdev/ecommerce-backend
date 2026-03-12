import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
