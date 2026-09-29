import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

import { CartDetail } from '../../cart-details/entities/cart-detail.entity';

@Entity('carritos')
export class Cart {
  @PrimaryGeneratedColumn()
  id_carrito!: number;

  @Column()
  id_usuario!: number;

  @CreateDateColumn()
  fecha_creacion!: Date;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'id_usuario',
  })
  usuario!: User;

  @OneToMany(
    () => CartDetail,
    (cartDetail) =>
      cartDetail.carrito,
  )
  detalles!: CartDetail[];
}