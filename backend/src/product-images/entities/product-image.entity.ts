import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';

@Entity('imagenes_producto')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id_imagen!: number;

  @Column()
  id_producto!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  url_imagen!: string;

  @Column({
    default: 0,
  })
  orden!: number;

  @Column({
    default: false,
  })
  es_principal!: boolean;

  @ManyToOne(() => Product, (product) => product.imagenes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_producto' })
  producto!: Product;
}
