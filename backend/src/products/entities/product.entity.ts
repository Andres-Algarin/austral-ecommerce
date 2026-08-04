import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('productos')
export class Product {
  @PrimaryGeneratedColumn()
  id_producto!: number;

  @Column()
  id_categoria!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column('text')
  descripcion!: string;

  @Column('text')
  beneficios!: string;

  @Column('text')
  ingredientes!: string;

  @Column('text')
  modo_uso!: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  precio!: number;

  @Column({
    default: 0,
  })
  stock!: number;

  @Column({
    nullable: true,
    length: 255,
  })
  imagen_principal!: string;

  @Column({
    default: true,
  })
  estado!: boolean;
}
