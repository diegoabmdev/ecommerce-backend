import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../modules/products/entities/product.entity';
import { BaseResponseDto } from './base-response.dto';

class MetaDto {
  @ApiProperty({ example: 100 }) total: number;
  @ApiProperty({ example: 10 }) limit: number;
  @ApiProperty({ example: 0 }) offset: number;
  @ApiProperty({ example: 10 }) totalPages: number;
}

export class ProductListResponseDto extends BaseResponseDto {
  @ApiProperty({ type: [Product] })
  data: Product[];

  @ApiProperty()
  meta: MetaDto;
}
