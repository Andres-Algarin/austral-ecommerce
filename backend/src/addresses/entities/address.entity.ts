import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('direcciones')
export class Address {
  @PrimaryGeneratedColumn()
  id_direccion!: number;

  @Column()
  id_usuario!: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  alias!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  direccion!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  ciudad!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  departamento!: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  codigo_postal!: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono_contacto!: string;

  @Column({
    default: false,
  })
  predeterminada!: boolean;

  @CreateDateColumn()
  fecha_creacion!: Date;

  @ManyToOne(() => User, (user) => user.direcciones)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: User;
}