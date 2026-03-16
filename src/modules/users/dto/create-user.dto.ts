import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from './create-address.dto';

export class CreateUserDto {
  @ApiProperty({
    example: 'admin@ejemplo.com',
    description: 'Correo único de registro',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    minLength: 6,
    description: 'Contraseña segura, mínimo 6 caracteres',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    type: [CreateAddressDto],
    required: false,
    description: 'Lista opcional de direcciones iniciales',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses?: CreateAddressDto[];
}
