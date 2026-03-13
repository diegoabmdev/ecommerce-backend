import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: 'Mensaje detallado del error',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty({ example: '2024-03-20T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/products' })
  path: string;
}
