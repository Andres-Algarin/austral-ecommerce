import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id_usuario: number;
    correo: string;
    rol: string;
  };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @Get()
  getCart(@Req() req: AuthenticatedRequest) {
    return this.cartService.getCart(
      req.user.id_usuario,
    );
  }

  @Post('items')
  addProduct(
    @Req() req: AuthenticatedRequest,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addProduct(
      req.user.id_usuario,
      addToCartDto.id_producto,
      addToCartDto.cantidad,
    );
  }

  @Patch('items/:id')
  updateQuantity(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateQuantity(
      req.user.id_usuario,
      id,
      updateCartItemDto.cantidad,
    );
  }

  @Delete('items/:id')
  removeProduct(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.removeProduct(
      req.user.id_usuario,
      id,
    );
  }

  @Delete()
  clearCart(@Req() req: AuthenticatedRequest) {
    return this.cartService.clearCart(
      req.user.id_usuario,
    );
  }
}