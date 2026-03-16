import { ApiProperty } from '@nestjs/swagger';

class UserAuthDataDto {
  @ApiProperty({ example: 'usuario@correo.com' })
  email: string;
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
