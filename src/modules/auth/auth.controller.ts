import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';
import {
  ApiValidationResponse,
  ApiServerErrors,
} from '../../common/decorators/swagger-errors.decorator';
import { LoginResponseDataDto } from 'src/common/responses/auth-responses.dto';
import { Auth } from '../../common/decorators/auth.decorator';

@ApiTags('Auth')
@ApiServerErrors()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Retorna el perfil del usuario y el token JWT necesario para rutas protegidas.',
  })
  @ApiBaseResponse(LoginResponseDataDto, 'Login exitoso')
  @ApiValidationResponse()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('check-status')
  @Auth()
  @ApiOperation({ summary: 'Verificar estado del token' })
  @ApiBaseResponse(LoginResponseDataDto, 'Token renovado/válido')
  checkAuthStatus(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
