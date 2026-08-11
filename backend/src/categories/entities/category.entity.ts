import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';

@Entity('categorias')
export class Category {
  @PrimaryGeneratedColumn()
  id_categoria!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  imagen!: string;

  @Column({
    default: true,
  })
  estado!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  fecha_creacion!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  fecha_actualizacion!: Date;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}