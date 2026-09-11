import {
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(2, 100)
  nombre!: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  imagen?: string;
}