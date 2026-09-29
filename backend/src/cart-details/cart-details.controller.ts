import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { CartDetailsService } from './cart-details.service';

import { CreateCartDetailDto } from './dto/create-cart-detail.dto';
import { UpdateCartDetailDto } from './dto/update-cart-detail.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    id_usuario: number;
    correo: string;
    rol: string;
  };
}

@Controller('cart-details')
@UseGuards(JwtAuthGuard)
export class CartDetailsController {
  constructor(
    private readonly cartDetailsService: CartDetailsService,
  ) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createCartDetailDto: CreateCartDetailDto,
  ) {
    return this.cartDetailsService.create(
      req.user.id_usuario,
      createCartDetailDto,
    );
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
  ) {
    return this.cartDetailsService.findAll(
      req.user.id_usuario,
    );
  }

  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartDetailsService.findOneForUser(
      id,
      req.user.id_usuario,
    );
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartDetailDto: UpdateCartDetailDto,
  ) {
    return this.cartDetailsService.update(
      id,
      req.user.id_usuario,
      updateCartDetailDto,
    );
  }

  @Delete(':id')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartDetailsService.remove(
      id,
      req.user.id_usuario,
    );
  }
} 