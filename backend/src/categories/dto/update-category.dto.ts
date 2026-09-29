import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  nombre?: string;

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