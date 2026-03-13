import { ApiProperty } from '@nestjs/swagger';

class UserAuthDataDto {
  @ApiProperty({ example: 'usuario@correo.com' })
  email: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;
}

export class LoginResponseDataDto {
  @ApiProperty({ type: UserAuthDataDto })
  user: UserAuthDataDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Token para autenticación',
  })
  token: string;
}
