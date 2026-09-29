import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';

import { ProductImagesService } from './product-images.service';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { imageUploadOptions } from '../common/uploads';

@Controller('product-images')
export class ProductImagesController {
  constructor(
    private readonly productImagesService: ProductImagesService,
  ) {}

  // Público. También vienen en GET /products/:id como "imagenes".
  @Get('product/:id_producto')
  findByProduct(
    @Param('id_producto', ParseIntPipe) id_producto: number,
  ) {
    return this.productImagesService.findByProduct(id_producto);
  }

  // Admin: subir hasta 10 imágenes en el campo "imagenes".
  @Post('product/:id_producto')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor(
      'imagenes',
      10,
      imageUploadOptions('products', 'galeria'),
    ),
  )
  addImages(
    @Param('id_producto', ParseIntPipe) id_producto: number,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.productImagesService.addImages(
      id_producto,
      files.map((file) => `/uploads/products/${file.filename}`),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductImageDto: UpdateProductImageDto,
  ) {
    return this.productImagesService.update(
      id,
      updateProductImageDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productImagesService.remove(id);
  }
}
