import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'correo@gmail.com',
    description: 'Correo registrado',
    required: true,
  })
  @IsEmail({}, { message: 'El formato del correo no es válido' })
  email: string;

  @ApiProperty({
    example: '123456Ab@',
    description: 'Contraseña de tu cuenta',
    required: true,
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
