import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Multer } from 'multer';

import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll() {
    return this.productsRepository.find({
      relations: {
        category: true,
      },
      order: {
        id_producto: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const product =
      await this.productsRepository.findOne({
        where: {
          id_producto: id,
        },
        relations: {
          category: true,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Producto no encontrado',
      );
    }

    return product;
  }

  async create(
    createProductDto: CreateProductDto,
    imagenPrincipal?: Multer.File,
  ) {
    const category =
      await this.categoriesRepository.findOne({
        where: {
          id_categoria:
            createProductDto.id_categoria,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'La categoría indicada no existe',
      );
    }

    const existingProduct =
      await this.productsRepository.findOne({
        where: {
          nombre: createProductDto.nombre,
        },
      });

    if (existingProduct) {
      throw new ConflictException(
        'Ya existe un producto con ese nombre',
      );
    }

    const product = new Product();

    product.id_categoria =
      createProductDto.id_categoria;

    product.nombre =
      createProductDto.nombre;

    product.descripcion =
      createProductDto.descripcion ?? '';

    product.beneficios =
      createProductDto.beneficios ?? '';

    product.ingredientes =
      createProductDto.ingredientes ?? '';

    product.modo_uso =
      createProductDto.modo_uso ?? '';

    product.precio =
      createProductDto.precio;

    product.stock =
      createProductDto.stock;

    product.imagen_principal =
      imagenPrincipal
        ? `/uploads/products/${imagenPrincipal.filename}`
        : '';

    product.estado = true;

    product.category = category;

    return this.productsRepository.save(
      product,
    );
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    imagenPrincipal?: Multer.File,
  ) {
    const product =
      await this.findOne(id);

    if (
      updateProductDto.id_categoria !==
        undefined &&
      updateProductDto.id_categoria !==
        product.id_categoria
    ) {
      const category =
        await this.categoriesRepository.findOne({
          where: {
            id_categoria:
              updateProductDto.id_categoria,
          },
        });

      if (!category) {
        throw new NotFoundException(
          'La categoría indicada no existe',
        );
      }

      product.id_categoria =
        updateProductDto.id_categoria;

      product.category = category;
    }

    if (
      updateProductDto.nombre &&
      updateProductDto.nombre !==
        product.nombre
    ) {
      const existingProduct =
        await this.productsRepository.findOne({
          where: {
            nombre:
              updateProductDto.nombre,
          },
        });

      if (existingProduct) {
        throw new ConflictException(
          'Ya existe un producto con ese nombre',
        );
      }

      product.nombre =
        updateProductDto.nombre;
    }

    if (
      updateProductDto.descripcion !==
      undefined
    ) {
      product.descripcion =
        updateProductDto.descripcion;
    }

    if (
      updateProductDto.beneficios !==
      undefined
    ) {
      product.beneficios =
        updateProductDto.beneficios;
    }

    if (
      updateProductDto.ingredientes !==
      undefined
    ) {
      product.ingredientes =
        updateProductDto.ingredientes;
    }

    if (
      updateProductDto.modo_uso !==
      undefined
    ) {
      product.modo_uso =
        updateProductDto.modo_uso;
    }

    if (
      updateProductDto.precio !==
      undefined
    ) {
      product.precio =
        updateProductDto.precio;
    }

    if (
      updateProductDto.stock !==
      undefined
    ) {
      product.stock =
        updateProductDto.stock;
    }

    if (imagenPrincipal) {
      product.imagen_principal =
        `/uploads/products/${imagenPrincipal.filename}`;
    }

    return this.productsRepository.save(
      product,
    );
  }

  async remove(id: number) {
    const product =
      await this.findOne(id);

    await this.productsRepository.remove(
      product,
    );

    return {
      message:
        'Producto eliminado correctamente',
    };
  }
}