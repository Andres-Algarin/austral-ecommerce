import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id_usuario!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  apellido!: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  cedula!: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  correo!: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: ['cliente', 'admin'],
    default: 'cliente',
  })
  rol!: string;

  @Column({
    default: true,
  })
  estado!: boolean;

  @CreateDateColumn()
  fecha_registro!: Date;

  @UpdateDateColumn()
  fecha_actualizacion!: Date;
}