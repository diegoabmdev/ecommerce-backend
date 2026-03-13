// src/common/decorators/auth.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserRoleGuard } from '../../modules/auth/guards/user-role.guard';
import { RoleProtected } from '../../modules/auth/decorators/role-protected.decorator';
import { ValidRoles } from '../../modules/auth/interfaces/valid-roles';

export function Auth(role: ValidRoles = ValidRoles.customer) {
  return applyDecorators(
    RoleProtected(role),
    UseGuards(AuthGuard(), UserRoleGuard),
    ApiBearerAuth(),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido o expirado',
      content: {
        'application/json': {
          example: {
            success: false,
            statusCode: 401,
            message: 'Error, sesión expirada o token inválido',
            timestamp: new Date().toISOString(),
            path: '/api/v1/...',
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido - Rol insuficiente',
      content: {
        'application/json': {
          example: {
            success: false,
            statusCode: 403,
            message: `No tienes los permisos necesarios (${role})`,
            timestamp: new Date().toISOString(),
            path: '/api/v1/...',
          },
        },
      },
    }),
  );
}
