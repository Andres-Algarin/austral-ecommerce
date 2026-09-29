import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('resenas')
export class Review {
  @PrimaryGeneratedColumn()
  id_resena!: number;

  @Column()
  id_producto!: number;

  @Column()
  id_usuario!: number;

  // Entre 1 y 5 (también lo valida la base de datos).
  @Column({
    type: 'tinyint',
  })
  calificacion!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  comentario!: string | null;

  @CreateDateColumn()
  fecha!: Date;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_producto' })
  producto!: Product;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: User;
}
