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

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    id_usuario: number;
    correo: string;
    rol: string;
  };
}

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  // Público: reseñas, promedio y distribución de estrellas.
  @Get('product/:id_producto')
  findByProduct(
    @Param('id_producto', ParseIntPipe) id_producto: number,
  ) {
    return this.reviewsService.findByProduct(id_producto);
  }

  // Para que el frontend sepa si mostrar el formulario.
  @Get('product/:id_producto/eligibility')
  @UseGuards(JwtAuthGuard)
  eligibility(
    @Request() req: AuthenticatedRequest,
    @Param('id_producto', ParseIntPipe) id_producto: number,
  ) {
    return this.reviewsService.eligibility(
      req.user.id_usuario,
      id_producto,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(
      req.user.id_usuario,
      createReviewDto,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(
      id,
      req.user.id_usuario,
      updateReviewDto,
    );
  }

  // El autor o un admin (moderación).
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reviewsService.remove(id, req.user);
  }
}
