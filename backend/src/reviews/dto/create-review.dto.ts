import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @IsPositive()
  id_producto!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  calificacion!: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(1000)
  comentario?: string;
}
