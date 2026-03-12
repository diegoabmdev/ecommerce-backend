import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Av. Siempre Viva' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '742' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  @IsString()
  @IsOptional()
  apartment?: string;

  @ApiProperty({ example: 'Santiago' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Región Metropolitana' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: true, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
