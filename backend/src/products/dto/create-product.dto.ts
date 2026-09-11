import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateProductDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_categoria!: number;

  @IsString()
  @Length(2, 150)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  beneficios?: string;

  @IsOptional()
  @IsString()
  ingredientes?: string;

  @IsOptional()
  @IsString()
  modo_uso?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;
}