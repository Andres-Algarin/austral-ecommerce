import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { OrderDetail } from '../order-details/entities/order-detail.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

/*
 * Reglas:
 * - Solo puede reseñar quien compró el producto y ya lo recibió
 *   (pedido en estado "Entregado").
 * - Una reseña por usuario y producto (se puede editar).
 * - En público se muestra el autor como "Nombre A." (sin datos personales).
 */
@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  // ============================================================
  // RESEÑAS DE UN PRODUCTO (público)
  // ============================================================

  async findByProduct(id_producto: number) {
    const resenas = await this.reviewsRepository.find({
      where: {
        id_producto,
      },
      relations: {
        usuario: true,
      },
      order: {
        fecha: 'DESC',
      },
    });

    const total = resenas.length;

    const suma = resenas.reduce(
      (acc, resena) => acc + resena.calificacion,
      0,
    );

    const distribucion: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const resena of resenas) {
      distribucion[resena.calificacion]++;
    }

    return {
      promedio: total ? Math.round((suma / total) * 10) / 10 : 0,
      total,
      distribucion,
      data: resenas.map((resena) => this.toPublic(resena)),
    };
  }

  // ============================================================
  // ¿PUEDE EL USUARIO RESEÑAR ESTE PRODUCTO?
  // ============================================================

  async eligibility(id_usuario: number, id_producto: number) {
    const miResena = await this.reviewsRepository.findOne({
      where: {
        id_usuario,
        id_producto,
      },
    });

    if (miResena) {
      return {
        puede_resenar: false,
        motivo: 'Ya reseñaste este producto. Puedes editar tu reseña.',
        mi_resena: miResena,
      };
    }

    const comprado = await this.hasReceivedProduct(
      id_usuario,
      id_producto,
    );

    return {
      puede_resenar: comprado,
      motivo: comprado
        ? null
        : 'Solo puedes reseñar productos que hayas comprado y recibido.',
      mi_resena: null,
    };
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    id_usuario: number,
    createReviewDto: CreateReviewDto,
  ) {
    const { id_producto, calificacion, comentario } =
      createReviewDto;

    const producto = await this.reviewsRepository.manager.findOne(
      Product,
      {
        where: {
          id_producto,
        },
      },
    );

    if (!producto) {
      throw new NotFoundException(
        `No existe un producto con el ID ${id_producto}`,
      );
    }

    if (!(await this.hasReceivedProduct(id_usuario, id_producto))) {
      throw new ForbiddenException(
        'Solo puedes reseñar productos que hayas comprado y recibido.',
      );
    }

    const existente = await this.reviewsRepository.findOne({
      where: {
        id_usuario,
        id_producto,
      },
    });

    if (existente) {
      throw new ConflictException(
        'Ya reseñaste este producto. Puedes editar tu reseña.',
      );
    }

    const resena = await this.reviewsRepository.save(
      this.reviewsRepository.create({
        id_usuario,
        id_producto,
        calificacion,
        comentario: comentario || null,
      }),
    );

    return this.findOne(resena.id_resena);
  }

  // ============================================================
  // EDITAR (solo el autor)
  // ============================================================

  async update(
    id: number,
    id_usuario: number,
    updateReviewDto: UpdateReviewDto,
  ) {
    const resena = await this.reviewsRepository.findOne({
      where: {
        id_resena: id,
        id_usuario,
      },
    });

    if (!resena) {
      throw new NotFoundException(
        `No existe una reseña tuya con el ID ${id}`,
      );
    }

    if (updateReviewDto.calificacion !== undefined) {
      resena.calificacion = updateReviewDto.calificacion;
    }

    if (updateReviewDto.comentario !== undefined) {
      resena.comentario = updateReviewDto.comentario || null;
    }

    await this.reviewsRepository.save(resena);

    return this.findOne(id);
  }

  // ============================================================
  // ELIMINAR (el autor o un admin)
  // ============================================================

  async remove(
    id: number,
    user: { id_usuario: number; rol: string },
  ) {
    const resena = await this.reviewsRepository.findOne({
      where: {
        id_resena: id,
        ...(user.rol !== 'admin' && {
          id_usuario: user.id_usuario,
        }),
      },
    });

    if (!resena) {
      throw new NotFoundException(
        `No existe una reseña con el ID ${id}`,
      );
    }

    await this.reviewsRepository.remove(resena);

    return {
      message: 'Reseña eliminada correctamente',
    };
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async findOne(id: number) {
    const resena = await this.reviewsRepository.findOneOrFail({
      where: {
        id_resena: id,
      },
      relations: {
        usuario: true,
      },
    });

    return this.toPublic(resena);
  }

  private async hasReceivedProduct(
    id_usuario: number,
    id_producto: number,
  ) {
    const compras = await this.reviewsRepository.manager.count(
      OrderDetail,
      {
        where: {
          id_producto,
          pedido: {
            id_usuario,
            estado: 'Entregado',
          },
        },
      },
    );

    return compras > 0;
  }

  private toPublic(resena: Review) {
    const inicial = resena.usuario?.apellido?.charAt(0);

    return {
      id_resena: resena.id_resena,
      id_producto: resena.id_producto,
      id_usuario: resena.id_usuario,
      calificacion: resena.calificacion,
      comentario: resena.comentario,
      fecha: resena.fecha,
      autor: resena.usuario
        ? `${resena.usuario.nombre}${inicial ? ` ${inicial}.` : ''}`
        : 'Usuario',
    };
  }
}
