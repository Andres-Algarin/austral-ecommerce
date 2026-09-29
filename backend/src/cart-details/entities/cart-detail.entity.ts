import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Cart } from '../../carts/entities/cart.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('detalle_carrito')
export class CartDetail {
  @PrimaryGeneratedColumn()
  id_detalle_carrito!: number;

  @Column()
  id_carrito!: number;

  @Column()
  id_producto!: number;

  @Column()
  cantidad!: number;

  @CreateDateColumn()
  fecha_agregado!: Date;

  @ManyToOne(() => Cart)
  @JoinColumn({ name: 'id_carrito' })
  carrito!: Cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'id_producto' })
  producto!: Product;
}