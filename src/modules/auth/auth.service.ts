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
}
