import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPositive,
  MaxLength,
} from 'class-validator';

/*
 * El pedido se arma a partir del carrito del usuario.
 *
 * Productos, precios, subtotal, descuento y total los calcula
 * el backend: el cliente solo elige la dirección y el receptor.
 */
export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  id_direccion!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_receptor?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cedula_receptor?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefono_receptor?: string;
}
