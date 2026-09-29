import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';

import { CartsService } from './carts.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    id_usuario: number;
    correo: string;
    rol: string;
  };
}

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
  ) {}

  /*
   * Obtener el carrito del usuario autenticado.
   *
   * Si no existe, se crea automáticamente.
   */
  @Get('me')
  findMine(
    @Request() req: AuthenticatedRequest,
  ) {
    return this.cartsService.findOrCreateByUser(
      req.user.id_usuario,
    );
  }
}