import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
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

  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsNumber()
  @Min(0)
  precio!: number;

  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsString()
  imagen_principal?: string;

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

  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  id_categoria!: number;
}