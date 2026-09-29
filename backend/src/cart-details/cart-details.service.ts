import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartDetail } from './entities/cart-detail.entity';
import { Cart } from '../carts/entities/cart.entity';
import { Product } from '../products/entities/product.entity';

import { CreateCartDetailDto } from './dto/create-cart-detail.dto';
import { UpdateCartDetailDto } from './dto/update-cart-detail.dto';

@Injectable()
export class CartDetailsService {
  constructor(
    @InjectRepository(CartDetail)
    private readonly cartDetailsRepository: Repository<CartDetail>,

    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(
    id_usuario: number,
    createCartDetailDto: CreateCartDetailDto,
  ) {
    const { id_producto, cantidad } = createCartDetailDto;

    /*
     * Buscamos o creamos automáticamente
     * el carrito del usuario autenticado.
     */
    let carrito = await this.cartsRepository.findOne({
      where: {
        id_usuario,
      },
    });

    if (!carrito) {
      carrito = this.cartsRepository.create({
        id_usuario,
      });

      carrito = await this.cartsRepository.save(carrito);
    }

    /*
     * Comprobamos que el producto exista.
     */
    const producto = await this.productsRepository.findOne({
      where: {
        id_producto,
      },
      relations: {
        category: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(
        `No existe un producto con el ID ${id_producto}`,
      );
    }

    /*
     * No permitimos agregar productos inactivos
     * ni de categorías inactivas.
     */
    if (!producto.estado || !producto.category?.estado) {
      throw new BadRequestException(
        'El producto no está disponible.',
      );
    }

    /*
     * Comprobamos el stock disponible.
     */
    if (producto.stock < cantidad) {
      throw new BadRequestException(
        `No hay suficiente stock. Stock disponible: ${producto.stock}.`,
      );
    }

    /*
     * Comprobamos si el producto ya está en el carrito.
     */
    const detalleExistente =
      await this.cartDetailsRepository.findOne({
        where: {
          id_carrito: carrito.id_carrito,
          id_producto,
        },
      });

    /*
     * Si ya existe, sumamos la cantidad.
     */
    if (detalleExistente) {
      const nuevaCantidad =
        detalleExistente.cantidad + cantidad;

      if (nuevaCantidad > producto.stock) {
        throw new BadRequestException(
          `No puedes agregar esa cantidad. Stock disponible: ${producto.stock}.`,
        );
      }

      detalleExistente.cantidad = nuevaCantidad;

      const detalleActualizado =
        await this.cartDetailsRepository.save(
          detalleExistente,
        );

      return this.findOneForUser(
        detalleActualizado.id_detalle_carrito,
        id_usuario,
      );
    }

    /*
     * Creamos el detalle del carrito.
     */
    const detalle = this.cartDetailsRepository.create({
      id_carrito: carrito.id_carrito,
      id_producto,
      cantidad,
    });

    const detalleGuardado =
      await this.cartDetailsRepository.save(detalle);

    return this.findOneForUser(
      detalleGuardado.id_detalle_carrito,
      id_usuario,
    );
  }

  async findAll(id_usuario: number) {
    const carrito = await this.cartsRepository.findOne({
      where: {
        id_usuario,
      },
    });

    if (!carrito) {
      return [];
    }

    return this.cartDetailsRepository.find({
      where: {
        id_carrito: carrito.id_carrito,
      },
      relations: {
        producto: true,
      },
      order: {
        id_detalle_carrito: 'ASC',
      },
    });
  }

  async findOneForUser(
    id: number,
    id_usuario: number,
  ) {
    const detalle =
      await this.cartDetailsRepository.findOne({
        where: {
          id_detalle_carrito: id,
        },
        relations: {
          producto: true,
          carrito: true,
        },
      });

    if (!detalle) {
      throw new NotFoundException(
        `No existe un detalle de carrito con el ID ${id}`,
      );
    }

    if (detalle.carrito.id_usuario !== id_usuario) {
      throw new NotFoundException(
        `No existe un detalle de carrito con el ID ${id}`,
      );
    }

    return detalle;
  }

  async update(
    id: number,
    id_usuario: number,
    updateCartDetailDto: UpdateCartDetailDto,
  ) {
    const detalle = await this.findOneForUser(
      id,
      id_usuario,
    );

    const producto = await this.productsRepository.findOne({
      where: {
        id_producto: detalle.id_producto,
      },
      relations: {
        category: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(
        `No existe el producto con el ID ${detalle.id_producto}`,
      );
    }

    if (!producto.estado || !producto.category?.estado) {
      throw new BadRequestException(
        'El producto ya no está disponible.',
      );
    }

    if (
      updateCartDetailDto.cantidad >
      producto.stock
    ) {
      throw new BadRequestException(
        `No puedes agregar esa cantidad. Stock disponible: ${producto.stock}.`,
      );
    }

    detalle.cantidad =
      updateCartDetailDto.cantidad;

    await this.cartDetailsRepository.save(detalle);

    return this.findOneForUser(id, id_usuario);
  }

  async remove(
    id: number,
    id_usuario: number,
  ) {
    const detalle = await this.findOneForUser(
      id,
      id_usuario,
    );

    await this.cartDetailsRepository.remove(detalle);

    return {
      message:
        'Producto eliminado del carrito correctamente.',
    };
  }
}