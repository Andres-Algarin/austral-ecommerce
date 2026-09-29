import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CartDetail } from '../cart-details/entities/cart-detail.entity';
import { OrderDetail } from '../order-details/entities/order-detail.entity';
import { ProductImage } from '../product-images/entities/product-image.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { deleteUploadedFile } from '../common/uploads';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOne({
      where: {
        id_categoria: createProductDto.id_categoria,
      },
    });

    if (!category) {
      throw new NotFoundException(
        `No existe una categoría con el ID ${createProductDto.id_categoria}`,
      );
    }

    const product = this.productRepository.create(createProductDto);

    return await this.productRepository.save(product);
  }

  // ============================================================
  // CATÁLOGO PÚBLICO
  //
  // Solo productos activos de categorías activas, con filtros,
  // búsqueda, orden y paginación.
  // ============================================================

  async findAll(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    if (
      query.min_precio !== undefined &&
      query.max_precio !== undefined &&
      query.min_precio > query.max_precio
    ) {
      throw new BadRequestException(
        'El precio mínimo no puede ser mayor que el máximo.',
      );
    }

    const qb = this.productRepository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.category', 'c')
      .where('p.estado = :activo', { activo: true })
      .andWhere('c.estado = :activo', { activo: true })
      .skip((page - 1) * limit)
      .take(limit);

    if (query.categoria !== undefined) {
      qb.andWhere('p.id_categoria = :categoria', {
        categoria: query.categoria,
      });
    }

    const texto = query.q?.trim();

    if (texto) {
      const like = `%${texto.replace(/[\\%_]/g, '\\$&')}%`;

      qb.andWhere(
        new Brackets((w) => {
          w.where('p.nombre LIKE :like', { like }).orWhere(
            'p.descripcion LIKE :like',
            { like },
          );
        }),
      );
    }

    if (query.min_precio !== undefined) {
      qb.andWhere('p.precio >= :min', { min: query.min_precio });
    }

    if (query.max_precio !== undefined) {
      qb.andWhere('p.precio <= :max', { max: query.max_precio });
    }

    if (query.en_stock) {
      qb.andWhere('p.stock > 0');
    }

    switch (query.orden) {
      case 'precio_asc':
        qb.orderBy('p.precio', 'ASC');
        break;
      case 'precio_desc':
        qb.orderBy('p.precio', 'DESC');
        break;
      case 'nombre':
        qb.orderBy('p.nombre', 'ASC');
        break;
      default:
        qb.orderBy('p.fecha_creacion', 'DESC');
    }

    qb.addOrderBy('p.id_producto', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================
  // ADMIN: todos los productos, incluidos los inactivos
  // ============================================================

  async findAllAdmin() {
    return await this.productRepository.find({
      relations: {
        category: true,
      },
      order: {
        id_producto: 'ASC',
      },
    });
  }

  // ============================================================
  // UN PRODUCTO (con su galería)
  //
  // Por defecto (público) solo encuentra productos activos de
  // categorías activas. Con soloActivos = false (admin) no filtra.
  // ============================================================

  async findOne(id: number, soloActivos = true) {
    const product = await this.productRepository.findOne({
      where: {
        id_producto: id,
        ...(soloActivos && {
          estado: true,
          category: {
            estado: true,
          },
        }),
      },
      relations: {
        category: true,
        imagenes: true,
      },
      order: {
        imagenes: {
          orden: 'ASC',
          id_imagen: 'ASC',
        },
      },
    });

    if (!product) {
      throw new NotFoundException(
        `No existe un producto con el ID ${id}`,
      );
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productRepository.findOne({
      where: {
        id_producto: id,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `No existe un producto con el ID ${id}`,
      );
    }

    if (
      updateProductDto.id_categoria !== undefined &&
      updateProductDto.id_categoria !== product.id_categoria
    ) {
      const category = await this.categoryRepository.findOne({
        where: {
          id_categoria: updateProductDto.id_categoria,
        },
      });

      if (!category) {
        throw new NotFoundException(
          `No existe una categoría con el ID ${updateProductDto.id_categoria}`,
        );
      }
    }

    const imagenAnterior = product.imagen_principal;

    Object.assign(product, updateProductDto);

    const guardado = await this.productRepository.save(product);

    if (
      updateProductDto.imagen_principal &&
      imagenAnterior !== updateProductDto.imagen_principal
    ) {
      // La nueva imagen principal no es de la galería.
      await this.productRepository.manager.update(
        ProductImage,
        { id_producto: id },
        { es_principal: false },
      );

      await this.deleteFileIfUnused(imagenAnterior);
    }

    return guardado;
  }

  // ============================================================
  // ELIMINAR
  //
  // Si el producto aparece en algún pedido no se puede borrar
  // (el historial de pedidos lo necesita): se desactiva.
  // En ambos casos se quita de los carritos.
  // ============================================================

  async remove(id: number) {
    const product = await this.findOne(id, false);

    const resultado = await this.productRepository.manager.transaction(
      async (manager) => {
        await manager.delete(CartDetail, {
          id_producto: id,
        });

        const enPedidos = await manager.count(OrderDetail, {
          where: {
            id_producto: id,
          },
        });

        if (enPedidos > 0) {
          await manager.update(
            Product,
            { id_producto: id },
            { estado: false },
          );

          return {
            eliminado: false,
            message: `El producto "${product.nombre}" tiene pedidos asociados, por lo que se desactivó en lugar de eliminarse.`,
          };
        }

        // La galería se borra en cascada en la base de datos.
        await manager.delete(Product, {
          id_producto: id,
        });

        return {
          eliminado: true,
          message: `Producto con ID ${id} eliminado correctamente`,
        };
      },
    );

    if (resultado.eliminado) {
      deleteUploadedFile(product.imagen_principal);

      for (const imagen of product.imagenes) {
        deleteUploadedFile(imagen.url_imagen);
      }
    }

    return resultado;
  }

  /*
   * La imagen principal puede ser también una imagen de la
   * galería; en ese caso no se borra el archivo.
   */
  private async deleteFileIfUnused(url: string | null) {
    if (!url) {
      return;
    }

    const enGaleria = await this.productRepository.manager.count(
      ProductImage,
      {
        where: {
          url_imagen: url,
        },
      },
    );

    if (enGaleria === 0) {
      deleteUploadedFile(url);
    }
  }
}
