// src/auth/decorators/get-user-optional.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const GetUserOptional = createParamDecorator(
  (
    data: keyof User | undefined,
    ctx: ExecutionContext,
  ): User | User[keyof User] | undefined => {
    const req = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = req.user;

    if (!user) return undefined;

    return data ? user[data] : user;
  },
);
