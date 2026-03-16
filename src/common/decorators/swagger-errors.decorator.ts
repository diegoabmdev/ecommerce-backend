//src/common/decorators/swagger-errors.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

const errorExample = (
  status: number,
  message: string | string[],
  path: string = '/api/v1/...',
) => ({
  content: {
    'application/json': {
      example: {
        success: false,
        statusCode: status,
        message: message,
        timestamp: '2026-03-15T15:00:00.000Z',
        path: path,
      },
    },
  },
});

export function ApiIdResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'ID no válido (UUID)',
      ...errorExample(400, 'UUID inválido'),
    }),
    ApiResponse({
      status: 404,
      description: 'Recurso no encontrado',
      ...errorExample(404, 'No se encontró el registro'),
    }),
  );
}

export function ApiValidationResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Error de validación de datos',
      ...errorExample(400, ['email must be an email', 'password is too short']),
    }),
    ApiResponse({
      status: 409,
      description: 'Conflicto - El registro ya existe',
      ...errorExample(409, 'Ya existe un registro con esos datos'),
    }),
  );
}

export function ApiServerErrors() {
  return applyDecorators(
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
      ...errorExample(500, 'Error interno del servidor'),
    }),
  );
}

export function ApiFileResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Error en el archivo (Formato o ausencia)',
      content: {
        'application/json': {
          example: {
            success: false,
            statusCode: 400,
            message: 'Asegúrese de enviar una imagen',
            timestamp: '...',
            path: '...',
          },
        },
      },
    }),
  );
}
