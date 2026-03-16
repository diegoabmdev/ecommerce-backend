import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  SchemaObject,
  ReferenceObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { BaseResponseDto } from '../responses/base-response.dto';

export const ApiBaseResponse = <TModel extends Type<any>>(
  model: TModel,
  description: string = 'Operación exitosa',
  status: number = HttpStatus.OK,
  isArray: boolean = false,
) => {
  const properties: Record<string, SchemaObject | ReferenceObject> = {
    data: isArray
      ? { type: 'array', items: { $ref: getSchemaPath(model) } }
      : { $ref: getSchemaPath(model) },
  };

  if (isArray) {
    properties.meta = {
      type: 'object',
      properties: {
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        lastPage: { type: 'number', example: 10 },
        limit: { type: 'number', example: 10 },
        offset: { type: 'number', example: 0 },
      },
    };
  }

  return applyDecorators(
    ApiExtraModels(BaseResponseDto, model),
    ApiResponse({
      status: status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: properties,
          },
        ],
      },
    }),
  );
};
