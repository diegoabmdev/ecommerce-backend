import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';
import { ResetPasswordDto } from '../users/dto/reset-password.dto';

interface AuthMessageResponse {
  message: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    return {
      user: { email: user.email, id: user.id },
      token: this.jwtService.sign({ id: user.id }),
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<AuthMessageResponse> {
    return await this.usersService.forgotPassword(forgotPasswordDto);
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<AuthMessageResponse> {
    return await this.usersService.resetPassword(resetPasswordDto);
  }
}
