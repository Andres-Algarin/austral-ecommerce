import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

import {
  ORDER_STATES,
  OrderState,
} from './entities/order.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles';

interface AuthenticatedRequest {
  user: {
    id_usuario: number;
    correo: string;
    rol: string;
  };
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  // ============================================================
  // ADMIN: LISTAR TODOS (opcional ?estado=Pendiente)
  // ============================================================

  @Get('admin')
  @Roles('admin')
  findAllAdmin(
    @Query('estado') estado?: string,
  ) {
    if (
      estado !== undefined &&
      !ORDER_STATES.includes(estado as OrderState)
    ) {
      throw new BadRequestException(
        'Estado de pedido no válido.',
      );
    }

    return this.ordersService.findAllAdmin(
      estado as OrderState | undefined,
    );
  }

  // ============================================================
  // ADMIN: RESUMEN (ventas, pedidos por estado, bajo stock)
  // Declarado antes de 'admin/:id'.
  // ============================================================

  @Get('admin/stats')
  @Roles('admin')
  adminStats() {
    return this.ordersService.adminStats();
  }

  // ============================================================
  // ADMIN: VER CUALQUIER PEDIDO
  // ============================================================

  @Get('admin/:id')
  @Roles('admin')
  findOneAdmin(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOneAdmin(id);
  }

  // ============================================================
  // ADMIN: CAMBIAR ESTADO / DESCUENTO / ENVÍO
  // ============================================================

  @Patch('admin/:id/status')
  @Roles('admin')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      id,
      updateOrderStatusDto,
    );
  }

  // ============================================================
  // RESUMEN DEL CHECKOUT (subtotal, envío, total, errores)
  // Declarado antes de ':id'.
  // ============================================================

  @Get('checkout/summary')
  checkoutSummary(
    @Request() req: AuthenticatedRequest,
  ) {
    return this.ordersService.checkoutSummary(
      req.user.id_usuario,
    );
  }

  // ============================================================
  // CREAR (CHECKOUT DESDE EL CARRITO)
  // ============================================================

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(
      req.user.id_usuario,
      createOrderDto,
    );
  }

  // ============================================================
  // MIS PEDIDOS
  // ============================================================

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
  ) {
    return this.ordersService.findAll(
      req.user.id_usuario,
    );
  }

  // ============================================================
  // MI PEDIDO
  // ============================================================

  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(
      id,
      req.user.id_usuario,
    );
  }

  // ============================================================
  // ACTUALIZAR DIRECCIÓN / RECEPTOR (solo "Pendiente")
  // ============================================================

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(
      id,
      req.user.id_usuario,
      updateOrderDto,
    );
  }

  // ============================================================
  // CANCELAR (solo "Pendiente"; devuelve el stock)
  //
  // Los pedidos no se eliminan: se cancelan para conservar
  // el historial.
  // ============================================================

  @Patch(':id/cancel')
  cancel(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.cancel(
      id,
      req.user.id_usuario,
    );
  }
}
