import { IsInt, IsPositive } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @IsPositive()
  id_producto!: number;

  @IsInt()
  @IsPositive()
  cantidad!: number;
}