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
  @PrimaryGeneratedColumn({
    name: 'id_categoria',
  })
  id_categoria!: number;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 100,
  })
  nombre!: string;

  @Column({
    name: 'imagen',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  imagen!: string | null;

  @Column({
    name: 'estado',
    type: 'boolean',
    default: true,
  })
  estado!: boolean;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamp',
  })
  fecha_creacion!: Date;

  @UpdateDateColumn({
    name: 'fecha_actualizacion',
    type: 'timestamp',
  })
  fecha_actualizacion!: Date;

  @OneToMany(
    () => Product,
    (product) => product.category,
  )
  products!: Product[];
}