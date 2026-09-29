import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) {
      return true;
    }

    if (value === 'false' || value === false) {
      return false;
    }

    return value;
  })
  @IsBoolean()
  estado?: boolean;
}