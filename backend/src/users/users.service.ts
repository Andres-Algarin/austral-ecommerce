import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ListUsersQueryDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/admin-user.dto';
import { AuthService } from '../auth/auth.service';

/*
 * Datos del usuario que se pueden devolver (nunca password_hash).
 */
const toPublicUser = (user: User) => ({
  id_usuario: user.id_usuario,
  nombre: user.nombre,
  apellido: user.apellido,
  cedula: user.cedula,
  correo: user.correo,
  telefono: user.telefono,
  rol: user.rol,
  estado: user.estado,
  fecha_registro: user.fecha_registro,
  fecha_actualizacion: user.fecha_actualizacion,
});

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly authService: AuthService,
  ) {}

  async findById(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id_usuario: id,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    return user;
  }

  async getProfile(id: number) {
    const user = await this.findById(id);

    return toPublicUser(user);
  }

  async updateProfile(
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.findById(id);

    if (
      updateUserDto.correo &&
      updateUserDto.correo !== user.correo
    ) {
      const existingEmail =
        await this.usersRepository.findOne({
          where: {
            correo: updateUserDto.correo,
          },
        });

      if (existingEmail) {
        throw new ConflictException(
          'El correo ya está registrado',
        );
      }
    }

    if (
      updateUserDto.cedula &&
      updateUserDto.cedula !== user.cedula
    ) {
      const existingCedula =
        await this.usersRepository.findOne({
          where: {
            cedula: updateUserDto.cedula,
          },
        });

      if (existingCedula) {
        throw new ConflictException(
          'La cédula ya está registrada',
        );
      }
    }

    if (updateUserDto.nombre !== undefined) {
      user.nombre = updateUserDto.nombre;
    }

    if (updateUserDto.apellido !== undefined) {
      user.apellido = updateUserDto.apellido;
    }

    if (updateUserDto.cedula !== undefined) {
      user.cedula = updateUserDto.cedula;
    }

    if (updateUserDto.correo !== undefined) {
      user.correo = updateUserDto.correo;
    }

    if (updateUserDto.telefono !== undefined) {
      user.telefono = updateUserDto.telefono;
    }

    const updatedUser =
      await this.usersRepository.save(user);

    return {
      message: 'Perfil actualizado correctamente',
      usuario: toPublicUser(updatedUser),
    };
  }

  // ============================================================
  // CAMBIAR CONTRASEÑA
  //
  // Cierra las demás sesiones (revoca los refresh tokens).
  // ============================================================

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.findById(id);

    const correcta = await bcrypt.compare(
      changePasswordDto.password_actual,
      user.password_hash,
    );

    if (!correcta) {
      throw new BadRequestException(
        'La contraseña actual no es correcta.',
      );
    }

    if (
      changePasswordDto.password_actual ===
      changePasswordDto.password_nueva
    ) {
      throw new BadRequestException(
        'La nueva contraseña debe ser distinta de la actual.',
      );
    }

    user.password_hash = await bcrypt.hash(
      changePasswordDto.password_nueva,
      10,
    );

    await this.usersRepository.save(user);
    await this.authService.revokeAllForUser(id);

    return {
      message:
        'Contraseña actualizada. Se cerraron las demás sesiones.',
    };
  }

  // ============================================================
  // ADMIN: LISTAR USUARIOS (paginado)
  // ============================================================

  async findAllAdmin(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.usersRepository
      .createQueryBuilder('u')
      .orderBy('u.fecha_registro', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.rol) {
      qb.andWhere('u.rol = :rol', { rol: query.rol });
    }

    if (query.estado !== undefined) {
      qb.andWhere('u.estado = :estado', {
        estado: query.estado,
      });
    }

    const texto = query.q?.trim();

    if (texto) {
      const like = `%${texto.replace(/[\\%_]/g, '\\$&')}%`;

      qb.andWhere(
        new Brackets((w) => {
          w.where('u.nombre LIKE :like', { like })
            .orWhere('u.apellido LIKE :like', { like })
            .orWhere('u.correo LIKE :like', { like })
            .orWhere('u.cedula LIKE :like', { like });
        }),
      );
    }

    const [usuarios, total] = await qb.getManyAndCount();

    return {
      data: usuarios.map(toPublicUser),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneAdmin(id: number) {
    return toPublicUser(await this.findById(id));
  }

  // ============================================================
  // ADMIN: ACTIVAR / DESACTIVAR
  //
  // Al desactivar, se cierran sus sesiones de inmediato.
  // ============================================================

  async updateStatus(
    id: number,
    id_admin: number,
    { estado }: UpdateUserStatusDto,
  ) {
    if (id === id_admin) {
      throw new BadRequestException(
        'No puedes cambiar el estado de tu propia cuenta.',
      );
    }

    const user = await this.findById(id);

    user.estado = estado;

    await this.usersRepository.save(user);

    if (!estado) {
      await this.authService.revokeAllForUser(id);
    }

    return toPublicUser(user);
  }

  // ============================================================
  // ADMIN: CAMBIAR ROL
  // ============================================================

  async updateRole(
    id: number,
    id_admin: number,
    { rol }: UpdateUserRoleDto,
  ) {
    if (id === id_admin) {
      throw new BadRequestException(
        'No puedes cambiar el rol de tu propia cuenta.',
      );
    }

    const user = await this.findById(id);

    user.rol = rol;

    await this.usersRepository.save(user);

    return toPublicUser(user);
  }
}
