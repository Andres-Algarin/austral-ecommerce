import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CartItem } from './cart-item.entity';

@Entity('carritos')
export class Cart {
  @PrimaryGeneratedColumn()
  id_carrito!: number;

  @Column()
  id_usuario!: number;

  @OneToMany(() => CartItem, (item) => item.carrito, {
    cascade: true,
  })
  items!: CartItem[];
}