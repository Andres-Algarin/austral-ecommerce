import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

/*
 * En "token" se guarda el hash SHA-256 del refresh token,
 * nunca el valor original.
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id_token!: number;

  @Column()
  id_usuario!: number;

  @Column({
    type: 'varchar',
    length: 500,
  })
  token!: string;

  @Column({
    type: 'timestamp',
  })
  expira_en!: Date;

  @Column({
    default: false,
  })
  revocado!: boolean;

  @CreateDateColumn()
  fecha_creacion!: Date;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: User;
}
