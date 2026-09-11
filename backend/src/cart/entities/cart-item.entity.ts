import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('detalle_carrito')
export class CartItem {
  @PrimaryGeneratedColumn()
  id_detalle_carrito!: number;

  @Column()
  id_carrito!: number;

  @Column()
  id_producto!: number;

  @Column()
  cantidad!: number;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_carrito' })
  carrito!: Cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'id_producto' })
  producto!: Product;
}