import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../../users/entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles: string[] = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );

    if (!roles || roles.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user: User }>();
    const user = req.user;

    if (!user) throw new BadRequestException('Usuario no encontrado');

    if (roles.includes(user.role)) return true;

    throw new ForbiddenException(
      `El usuario ${user.email} necesita uno de estos roles: [${roles.join(', ')}]`,
    );
  }
}
