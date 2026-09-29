import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { ProductImage } from './entities/product-image.entity';
import { Product } from '../products/entities/product.entity';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { deleteUploadedFile } from '../common/uploads';

/*
 * Galería de imágenes de un producto.
 *
 * La imagen marcada como principal se copia también en
 * productos.imagen_principal, que es la que usa el catálogo.
 */
@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly imagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async findByProduct(id_producto: number) {
    return await this.imagesRepository.find({
      where: {
        id_producto,
      },
      order: {
        orden: 'ASC',
        id_imagen: 'ASC',
      },
    });
  }

  // ============================================================
  // SUBIR IMÁGENES
  // ============================================================

  async addImages(
    id_producto: number,
    urls: string[],
  ) {
    if (urls.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos una imagen en el campo "imagenes".',
      );
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const producto = await manager.findOne(Product, {
          where: {
            id_producto,
          },
        });

        if (!producto) {
          throw new NotFoundException(
            `No existe un producto con el ID ${id_producto}`,
          );
        }

        const ultima = await manager.findOne(ProductImage, {
          where: {
            id_producto,
          },
          order: {
            orden: 'DESC',
          },
        });

        const tienePrincipal = await manager.count(ProductImage, {
          where: {
            id_producto,
            es_principal: true,
          },
        });

        const siguienteOrden = ultima ? ultima.orden + 1 : 0;

        const nuevas = await manager.save(
          urls.map((url_imagen, i) =>
            manager.create(ProductImage, {
              id_producto,
              url_imagen,
              orden: siguienteOrden + i,
              es_principal: false,
            }),
          ),
        );

        // Si el producto no tenía imagen principal,
        // la primera imagen subida pasa a serlo.
        if (!tienePrincipal && !producto.imagen_principal) {
          await this.setPrincipal(manager, nuevas[0]);
        }
      });
    } catch (error) {
      // Si algo falla, no dejar archivos huérfanos.
      urls.forEach(deleteUploadedFile);
      throw error;
    }

    return this.findByProduct(id_producto);
  }

  // ============================================================
  // CAMBIAR ORDEN / MARCAR COMO PRINCIPAL
  // ============================================================

  async update(
    id_imagen: number,
    updateProductImageDto: UpdateProductImageDto,
  ) {
    const imagen = await this.findOne(id_imagen);

    await this.dataSource.transaction(async (manager) => {
      if (updateProductImageDto.orden !== undefined) {
        imagen.orden = updateProductImageDto.orden;
        await manager.save(imagen);
      }

      if (updateProductImageDto.es_principal) {
        await this.setPrincipal(manager, imagen);
      }
    });

    return this.findByProduct(imagen.id_producto);
  }

  // ============================================================
  // ELIMINAR
  //
  // Si era la principal, la siguiente de la galería toma
  // su lugar (o el producto queda sin imagen principal).
  // ============================================================

  async remove(id_imagen: number) {
    const imagen = await this.findOne(id_imagen);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(ProductImage, { id_imagen });

      if (imagen.es_principal) {
        const siguiente = await manager.findOne(ProductImage, {
          where: {
            id_producto: imagen.id_producto,
          },
          order: {
            orden: 'ASC',
            id_imagen: 'ASC',
          },
        });

        if (siguiente) {
          await this.setPrincipal(manager, siguiente);
        } else {
          await manager.update(
            Product,
            { id_producto: imagen.id_producto },
            { imagen_principal: null },
          );
        }
      }
    });

    deleteUploadedFile(imagen.url_imagen);

    return {
      message: 'Imagen eliminada correctamente',
    };
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async findOne(id_imagen: number) {
    const imagen = await this.imagesRepository.findOne({
      where: {
        id_imagen,
      },
    });

    if (!imagen) {
      throw new NotFoundException(
        `No existe una imagen con el ID ${id_imagen}`,
      );
    }

    return imagen;
  }

  private async setPrincipal(
    manager: EntityManager,
    imagen: ProductImage,
  ) {
    await manager.update(
      ProductImage,
      { id_producto: imagen.id_producto },
      { es_principal: false },
    );

    await manager.update(
      ProductImage,
      { id_imagen: imagen.id_imagen },
      { es_principal: true },
    );

    await manager.update(
      Product,
      { id_producto: imagen.id_producto },
      { imagen_principal: imagen.url_imagen },
    );
  }
}
