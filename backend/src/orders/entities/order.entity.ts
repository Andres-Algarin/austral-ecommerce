import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Address } from '../../addresses/entities/address.entity';
import { User } from '../../users/entities/user.entity';
import { OrderDetail } from '../../order-details/entities/order-detail.entity';

export const ORDER_STATES = [
  'Pendiente',
  'Pagado',
  'Preparando',
  'Enviado',
  'Entregado',
  'Cancelado',
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

@Entity('pedidos')
export class Order {
  @PrimaryGeneratedColumn()
  id_pedido!: number;

  // ============================================================
  // USUARIO
  // ============================================================

  @Column()
  id_usuario!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: User;

  // ============================================================
  // DATOS DEL RECEPTOR
  // ============================================================

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  nombre_receptor!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  cedula_receptor!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono_receptor!: string | null;

  // ============================================================
  // DIRECCIÓN DE ENVÍO
  // ============================================================

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  direccion_envio!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  ciudad_envio!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  departamento_envio!: string | null;

  @Column()
  id_direccion!: number;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'id_direccion' })
  direccion_relacionada!: Address;

  // ============================================================
  // FECHAS
  // ============================================================

  @CreateDateColumn()
  fecha!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  fecha_envio!: Date | null;

  @UpdateDateColumn()
  fecha_actualizacion!: Date;

  // ============================================================
  // ESTADO
  // ============================================================

  @Column({
    type: 'enum',
    enum: ORDER_STATES,
    default: 'Pendiente',
  })
  estado!: OrderState;

  // ============================================================
  // VALORES DEL PEDIDO
  // ============================================================

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subtotal!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  descuento!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  costo_envio!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total!: number;

  // ============================================================
  // DETALLES DEL PEDIDO
  // ============================================================

  @OneToMany(
    () => OrderDetail,
    (orderDetail) => orderDetail.pedido,
  )
  detalles!: OrderDetail[];
}