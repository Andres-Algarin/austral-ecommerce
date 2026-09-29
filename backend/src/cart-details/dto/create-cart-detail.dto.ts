import {
  IsInt,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';

export class CreateCartDetailDto {
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  id_producto!: number;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  cantidad!: number;
}
