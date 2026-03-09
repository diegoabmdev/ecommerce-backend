import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'La calle es obligatoria' })
  street: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de la propiedad es obligatorio' })
  number: string;

  @IsString()
  @IsOptional()
  apartment?: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'La región es obligatoria' })
  region: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
