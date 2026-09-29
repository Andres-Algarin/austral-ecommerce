import {
  IsInt,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';

export class UpdateCartDetailDto {
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  cantidad!: number;
}