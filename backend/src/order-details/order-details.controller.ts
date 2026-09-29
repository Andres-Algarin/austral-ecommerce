import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';

import { OrderDetailsService } from './order-details.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    id_usuario: number;
    correo: string;
    rol: string;
  };
}

/*
 * Solo lectura: los detalles se generan en POST /orders.
 * El cliente ve los de sus pedidos; el admin, los de todos.
 */
@Controller('order-details')
@UseGuards(JwtAuthGuard)
export class OrderDetailsController {
  constructor(
    private readonly orderDetailsService: OrderDetailsService,
  ) {}

  // ============================================================
  // DETALLES DE UN PEDIDO
  // ============================================================

  @Get('order/:id_pedido')
  findByOrder(
    @Request() req: AuthenticatedRequest,
    @Param('id_pedido', ParseIntPipe) id_pedido: number,
  ) {
    return this.orderDetailsService.findByOrder(
      id_pedido,
      this.ownerFilter(req),
    );
  }

  // ============================================================
  // UN DETALLE
  // ============================================================

  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderDetailsService.findOne(
      id,
      this.ownerFilter(req),
    );
  }

  private ownerFilter(req: AuthenticatedRequest) {
    return req.user.rol === 'admin'
      ? undefined
      : req.user.id_usuario;
  }
}
