import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const ORDENES_PRODUCTO = [
  'recientes',
  'precio_asc',
  'precio_desc',
  'nombre',
] as const;

export type OrdenProducto = (typeof ORDENES_PRODUCTO)[number];

/*
 * GET /products?categoria=1&q=crema&min_precio=10000
 *   &max_precio=50000&en_stock=true&orden=precio_asc&page=1&limit=12
 */
export class ListProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoria?: number;

  // Busca en nombre y descripción.
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_precio?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_precio?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' || value === true
      ? true
      : value === 'false' || value === false
        ? false
        : value,
  )
  @IsBoolean()
  en_stock?: boolean;

  @IsOptional()
  @IsIn(ORDENES_PRODUCTO)
  orden?: OrdenProducto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
