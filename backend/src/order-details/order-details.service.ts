import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderDetail } from './entities/order-detail.entity';

/*
 * Los detalles de pedido se crean únicamente en el checkout
 * (OrdersService.create), dentro de la misma transacción que
 * el pedido, el descuento de stock y el vaciado del carrito.
 *
 * Aquí solo se consultan. Si se pasa id_usuario, se filtra
 * por el dueño del pedido; sin él (admin) no se filtra.
 */
@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailsRepository: Repository<OrderDetail>,
  ) {}

  // ============================================================
  // DETALLES DE UN PEDIDO
  // ============================================================

  async findByOrder(
    id_pedido: number,
    id_usuario?: number,
  ) {
    return await this.orderDetailsRepository.find({
      where: {
        id_pedido,
        ...(id_usuario !== undefined && {
          pedido: { id_usuario },
        }),
      },
      relations: {
        producto: true,
      },
      order: {
        id_detalle_pedido: 'ASC',
      },
    });
  }

  // ============================================================
  // UN DETALLE
  // ============================================================

  async findOne(
    id: number,
    id_usuario?: number,
  ) {
    const detalle =
      await this.orderDetailsRepository.findOne({
        where: {
          id_detalle_pedido: id,
          ...(id_usuario !== undefined && {
            pedido: { id_usuario },
          }),
        },
        relations: {
          producto: true,
        },
      });

    if (!detalle) {
      throw new NotFoundException(
        `No existe un detalle de pedido con el ID ${id}`,
      );
    }

    return detalle;
  }
}
