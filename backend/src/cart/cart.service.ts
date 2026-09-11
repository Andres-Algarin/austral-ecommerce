import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

 async getCart(userId: number): Promise<Cart> {
  let cart = await this.cartRepository.findOne({
    where: {
      id_usuario: userId,
    },
    relations: {
      items: {
        producto: true,
      },
    },
  });

  if (!cart) {
    const newCart = this.cartRepository.create({
      id_usuario: userId,
    });

    await this.cartRepository.save(newCart);

    cart = await this.cartRepository.findOne({
      where: {
        id_carrito: newCart.id_carrito,
      },
      relations: {
        items: {
          producto: true,
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(
        'No se pudo crear el carrito',
      );
    }
  }

  return cart;
}

  async addProduct(
    userId: number,
    productId: number,
    cantidad: number,
  ) {
    if (cantidad < 1) {
      throw new BadRequestException(
        'La cantidad debe ser mayor a 0',
      );
    }

    const product =
      await this.productRepository.findOne({
        where: {
          id_producto: productId,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Producto no encontrado',
      );
    }

    if (!product.estado) {
      throw new BadRequestException(
        'El producto no está disponible',
      );
    }

    if (product.stock < cantidad) {
      throw new BadRequestException(
        'No hay suficiente stock',
      );
    }

    const cart = await this.getCart(userId);

    let item =
      await this.cartItemRepository.findOne({
        where: {
          id_carrito: cart.id_carrito,
          id_producto: productId,
        },
      });

    if (item) {
      const nuevaCantidad =
        item.cantidad + cantidad;

      if (nuevaCantidad > product.stock) {
        throw new BadRequestException(
          'La cantidad solicitada supera el stock disponible',
        );
      }

      item.cantidad = nuevaCantidad;
    } else {
      item = this.cartItemRepository.create({
        id_carrito: cart.id_carrito,
        id_producto: productId,
        cantidad,
      });
    }

    await this.cartItemRepository.save(item);

    return this.getCart(userId);
  }

  async updateQuantity(
    userId: number,
    itemId: number,
    cantidad: number,
  ) {
    if (cantidad < 1) {
      throw new BadRequestException(
        'La cantidad debe ser mayor a 0',
      );
    }

    const cart = await this.getCart(userId);

    const item =
      await this.cartItemRepository.findOne({
        where: {
          id_detalle_carrito: itemId,
          id_carrito: cart.id_carrito,
        },
        relations: {
          producto: true,
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Producto no encontrado en el carrito',
      );
    }

    if (cantidad > item.producto.stock) {
      throw new BadRequestException(
        'La cantidad supera el stock disponible',
      );
    }

    item.cantidad = cantidad;

    await this.cartItemRepository.save(item);

    return this.getCart(userId);
  }

  async removeProduct(
    userId: number,
    itemId: number,
  ) {
    const cart = await this.getCart(userId);

    const item =
      await this.cartItemRepository.findOne({
        where: {
          id_detalle_carrito: itemId,
          id_carrito: cart.id_carrito,
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Producto no encontrado en el carrito',
      );
    }

    await this.cartItemRepository.remove(item);

    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.getCart(userId);

    await this.cartItemRepository.delete({
      id_carrito: cart.id_carrito,
    });

    return this.getCart(userId);
  }
}