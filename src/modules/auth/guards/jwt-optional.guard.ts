// src/auth/guards/jwt-optional.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = User>(
    err: any,
    user: TUser | false,
  ): TUser | undefined {
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
