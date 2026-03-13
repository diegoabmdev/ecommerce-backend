// src/common/decorators/swagger-errors.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiIdResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'ID no válido',
      content: {
        'application/json': {
          example: {
            success: false,
            statusCode: 400,
            message: 'UUID inválido',
            timestamp: '...',
            path: '...',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Recurso no encontrado',
      content: {
        'application/json': {
          example: {
            success: false,
            statusCode: 404,
            message: 'No se encontró el registro',
            timestamp: '...',
            path: '...',
          },
        },
      },
    }),
  );
}

export function ApiValidationResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Error de validación',
      content: {
        'application/json': {
          example: {
            success: false,
            statusCode: 400,
            message: ['field must be string'],
            timestamp: '...',
            path: '...',
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflicto de datos (Duplicados)',
      content: {
        'application/json': {
          example: {
            success: false,
            statusCode: 409,
            message: 'El registro ya existe',
            timestamp: '...',
            path: '...',
          },
        },
      },
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

export function ApiServerErrors() {
  return applyDecorators(
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
      content: {
        'application/json': {
          example: {
            success: false,
            statusCode: 500,
            message: 'Internal server error',
            timestamp: '...',
            path: '...',
          },
        },
      },
    }),
  );
}
