import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  imagen?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}