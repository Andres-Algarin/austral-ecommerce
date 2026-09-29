import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
  ) {}

  /*
   * Obtener el carrito del usuario.
   *
   * Si no existe, se crea automáticamente.
   */
  async findOrCreateByUser(
    id_usuario: number,
  ): Promise<Cart> {
    let carrito =
      await this.cartsRepository.findOne({
        where: {
          id_usuario,
        },
        relations: {
          detalles: {
            producto: true,
          },
        },
      });

    if (!carrito) {
      carrito =
        this.cartsRepository.create({
          id_usuario,
        });

      carrito =
        await this.cartsRepository.save(
          carrito,
        );

      /*
       * Volvemos a buscarlo para devolverlo
       * con sus relaciones.
       */
      carrito =
        await this.cartsRepository.findOne({
          where: {
            id_carrito:
              carrito.id_carrito,
          },
          relations: {
            detalles: {
              producto: true,
            },
          },
        });

      if (!carrito) {
        throw new NotFoundException(
          'No se pudo crear el carrito.',
        );
      }
    }

    return carrito;
  }
}