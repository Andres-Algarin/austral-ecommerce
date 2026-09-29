import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity';

import { Product } from '../../products/entities/product.entity';

@Entity('detalle_pedido')
export class OrderDetail {
  @PrimaryGeneratedColumn()
  id_detalle_pedido!: number;

  @Column()
  id_pedido!: number;

  @Column()
  id_producto!: number;

  @Column()
  cantidad!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  precio_unitario!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subtotal!: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'id_pedido' })
  pedido!: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'id_producto' })
  producto!: Product;
}