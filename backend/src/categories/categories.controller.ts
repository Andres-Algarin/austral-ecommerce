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

import { CategoriesService } from './categories.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { imageUploadOptions } from '../common/uploads';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  // ==========================================
  // CATEGORÍAS ACTIVAS
  // Público
  // ==========================================

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // ==========================================
  // TODAS LAS CATEGORÍAS (incluye inactivas)
  // Solo ADMIN. Declarado antes de ':id'.
  // ==========================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllAdmin() {
    return this.categoriesService.findAll(false);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOneAdmin(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.findOne(id, false);
  }

  // ==========================================
  // UNA CATEGORÍA ACTIVA
  // Público
  // ==========================================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.findOne(id);
  }

  // ==========================================
  // CREAR CATEGORÍA
  // Solo ADMIN
  // ==========================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor(
      'imagen',
      imageUploadOptions('categories', 'categoria'),
    ),
  )
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.create({
      ...createCategoryDto,

      imagen: file
        ? `/uploads/categories/${file.filename}`
        : undefined,
    });
  }

  // ==========================================
  // ACTUALIZAR CATEGORÍA
  // Solo ADMIN
  // ==========================================

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor(
      'imagen',
      imageUploadOptions('categories', 'categoria'),
    ),
  )
  update(
    @Param('id', ParseIntPipe) id: number,

    @Body() updateCategoryDto: UpdateCategoryDto,

    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateCategoryDto.imagen =
        `/uploads/categories/${file.filename}`;
    }

    return this.categoriesService.update(
      id,
      updateCategoryDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.remove(id);
  }
}
