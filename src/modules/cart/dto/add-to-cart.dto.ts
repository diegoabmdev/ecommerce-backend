import { IsUUID, IsInt, IsPositive, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number = 1;
}
