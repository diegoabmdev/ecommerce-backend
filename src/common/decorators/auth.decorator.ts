import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserRoleGuard } from '../../modules/auth/guards/user-role.guard';
import { RoleProtected } from '../../modules/auth/decorators/role-protected.decorator';
import { ValidRoles } from '../../modules/auth/interfaces/valid-roles';

export function Auth(...roles: ValidRoles[]) {
  const rolesMessage =
    roles.length > 0 ? roles.join(', ') : 'Cualquier rol autenticado';

  return applyDecorators(
    RoleProtected(...roles),
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
            timestamp: '2026-03-15T10:00:00.000Z',
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
            message: `El usuario usuario@correo.com necesita uno de estos roles: [${rolesMessage}]`,
            timestamp: '2026-03-15T10:00:00.000Z',
            path: '/api/v1/...',
          },
        },
      },
    }),
  );
}
