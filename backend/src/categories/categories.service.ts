import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { deleteUploadedFile } from '../common/uploads';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory =
      await this.categoryRepository.findOne({
        where: {
          nombre: createCategoryDto.nombre,
        },
      });

    if (existingCategory) {
      throw new ConflictException(
        'Ya existe una categoría con ese nombre.',
      );
    }

    const category =
      this.categoryRepository.create(createCategoryDto);

    return await this.categoryRepository.save(category);
  }

  // Por defecto (público) solo categorías activas.
  async findAll(soloActivas = true) {
    return await this.categoryRepository.find({
      where: soloActivas ? { estado: true } : {},
      order: {
        id_categoria: 'ASC',
      },
    });
  }

  async findOne(id: number, soloActivas = true) {
    const category =
      await this.categoryRepository.findOne({
        where: {
          id_categoria: id,
          ...(soloActivas && { estado: true }),
        },
      });

    if (!category) {
      throw new NotFoundException(
        `No existe una categoría con el ID ${id}`,
      );
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.findOne(id, false);

    if (
      updateCategoryDto.nombre &&
      updateCategoryDto.nombre !== category.nombre
    ) {
      const existingCategory =
        await this.categoryRepository.findOne({
          where: {
            nombre: updateCategoryDto.nombre,
          },
        });

      if (existingCategory) {
        throw new ConflictException(
          'Ya existe una categoría con ese nombre.',
        );
      }
    }

    const imagenAnterior = category.imagen;

    Object.assign(category, updateCategoryDto);

    const guardada = await this.categoryRepository.save(category);

    if (
      updateCategoryDto.imagen &&
      imagenAnterior !== updateCategoryDto.imagen
    ) {
      deleteUploadedFile(imagenAnterior);
    }

    return guardada;
  }

  async remove(id: number) {
    const category = await this.findOne(id, false);

    try {
      await this.categoryRepository.remove(category);

      deleteUploadedFile(category.imagen);

      return {
        message: `Categoría con ID ${id} eliminada correctamente`,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'No se puede eliminar la categoría porque tiene productos asociados.',
        );
      }

      throw error;
    }
  }
}