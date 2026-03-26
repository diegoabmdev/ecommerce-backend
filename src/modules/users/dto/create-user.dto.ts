import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  Matches,
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
    example: 'Ab123456!',
    description:
      'Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña es demasiado débil (debe incluir mayúscula, minúscula, número y carácter especial)',
  })
  password: string;

  @ApiProperty({ example: 'Diego Abanto' })
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({ example: 'diego_dev', required: false })
  @IsOptional()
  @IsString()
  username?: string;

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
