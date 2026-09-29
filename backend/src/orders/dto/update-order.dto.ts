import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

/*
 * Lo que el cliente puede cambiar de su pedido mientras
 * siga en estado "Pendiente": dirección y datos del receptor.
 */
export class UpdateOrderDto extends PartialType(
  CreateOrderDto,
) {}
