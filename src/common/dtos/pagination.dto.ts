import {
  IsOptional,
  IsPositive,
  Min,
  IsInt,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @IsInt()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
