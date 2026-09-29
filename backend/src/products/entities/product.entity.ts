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

import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from '../../product-images/entities/product-image.entity';

@Entity('productos')
export class Product {
  @PrimaryGeneratedColumn()
  id_producto!: number;

  @Column()
  id_categoria!: number;

  @Column({
    type: 'varchar',
    length: 150,
  })
  nombre!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  descripcion!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  beneficios!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  ingredientes!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  modo_uso!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  precio!: number;

  @Column({
    default: 0,
  })
  stock!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  imagen_principal!: string | null;

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

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'id_categoria' })
  category!: Category;

  // Galería de imágenes adicionales.
  @OneToMany(() => ProductImage, (image) => image.producto)
  imagenes!: ProductImage[];
}