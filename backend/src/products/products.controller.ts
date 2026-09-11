import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Multer } from 'multer';

import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('imagen_principal', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueSuffix =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          const extension =
            extname(file.originalname);

          callback(
            null,
            `producto-${uniqueSuffix}${extension}`,
          );
        },
      }),

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        if (
          !file.mimetype.startsWith('image/')
        ) {
          return callback(
            new Error(
              'Solo se permiten archivos de imagen',
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile()
    imagenPrincipal?: Multer.File,
  ) {
    return this.productsService.create(
      createProductDto,
      imagenPrincipal,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('imagen_principal', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueSuffix =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          const extension =
            extname(file.originalname);

          callback(
            null,
            `producto-${uniqueSuffix}${extension}`,
          );
        },
      }),

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        if (
          !file.mimetype.startsWith('image/')
        ) {
          return callback(
            new Error(
              'Solo se permiten archivos de imagen',
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile()
    imagenPrincipal?: Multer.File,
  ) {
    return this.productsService.update(
      id,
      updateProductDto,
      imagenPrincipal,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.remove(id);
  }
}