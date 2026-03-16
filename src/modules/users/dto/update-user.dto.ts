// src/modules/users/dto/update-user.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'Diego AM',
    required: false,
    description: 'Nombre completo del usuario',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    example: '+56912345678',
    required: false,
    description: 'Número de teléfono con código de área',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
