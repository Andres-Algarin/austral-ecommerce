import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

    return {
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
    };
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
      usuario: {
        id_usuario: updatedUser.id_usuario,
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        cedula: updatedUser.cedula,
        correo: updatedUser.correo,
        telefono: updatedUser.telefono,
        rol: updatedUser.rol,
        estado: updatedUser.estado,
      },
    };
  }
}