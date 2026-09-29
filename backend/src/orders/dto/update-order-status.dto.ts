import {
  IsIn,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

import {
  ORDER_STATES,
  type OrderState,
} from '../entities/order.entity';

/*
 * Solo para administradores.
 */
export class UpdateOrderStatusDto {
  @IsOptional()
  @IsIn(ORDER_STATES)
  estado?: OrderState;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  descuento?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costo_envio?: number;
}
