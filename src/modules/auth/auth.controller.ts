import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
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
import { ResetPasswordDto } from '../users/dto/reset-password.dto';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';
import { BaseResponseDto } from 'src/common/responses/base-response.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

interface AuthMessageResponse {
  message: string;
}

interface IAuthService {
  forgotPassword(dto: ForgotPasswordDto): Promise<AuthMessageResponse>;
  resetPassword(dto: ResetPasswordDto): Promise<AuthMessageResponse>;
  login(dto: LoginDto): any;
}

@ApiTags('Auth')
@ApiServerErrors()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Retorna el perfil del usuario y el token JWT necesario para rutas protegidas.',
  })
  @ApiBaseResponse(LoginResponseDataDto, 'Login exitoso', HttpStatus.OK)
  @ApiValidationResponse()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('check-status')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOperation({ summary: 'Verificar estado del token' })
  @ApiBaseResponse(LoginResponseDataDto, 'Token renovado/válido', HttpStatus.OK)
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkStatus(user);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description:
      'Envía un correo electrónico con un token único para restablecer la clave.',
  })
  @ApiBaseResponse(
    BaseResponseDto,
    'Correo enviado (si el usuario existe)',
    HttpStatus.OK,
    false,
    false,
  )
  @ApiValidationResponse()
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<AuthMessageResponse> {
    const service = this.authService as IAuthService;
    return await service.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cambiar la contraseña usando el token de recuperación',
  })
  @ApiBaseResponse(
    BaseResponseDto,
    'Contraseña actualizada correctamente',
    HttpStatus.OK,
    false,
    false,
  )
  @ApiValidationResponse()
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<AuthMessageResponse> {
    const service = this.authService as IAuthService;
    return await service.resetPassword(resetPasswordDto);
  }
}
