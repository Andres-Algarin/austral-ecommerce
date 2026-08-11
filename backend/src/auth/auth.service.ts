import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingEmail = await this.usersRepository.findOne({
      where: {
        correo: registerDto.correo,
      },
    });

    if (existingEmail) {
      throw new ConflictException(
        'El correo ya está registrado',
      );
    }

    const existingCedula = await this.usersRepository.findOne({
      where: {
        cedula: registerDto.cedula,
      },
    });

    if (existingCedula) {
      throw new ConflictException(
        'La cédula ya está registrada',
      );
    }

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      10,
    );

    const user = this.usersRepository.create({
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      cedula: registerDto.cedula,
      correo: registerDto.correo,
      telefono: registerDto.telefono,
      password_hash: passwordHash,
      rol: 'cliente',
      estado: true,
    });

    const savedUser = await this.usersRepository.save(user);

    return {
      message: 'Usuario registrado correctamente',
      usuario: {
        id_usuario: savedUser.id_usuario,
        nombre: savedUser.nombre,
        apellido: savedUser.apellido,
        cedula: savedUser.cedula,
        correo: savedUser.correo,
        telefono: savedUser.telefono,
        rol: savedUser.rol,
        estado: savedUser.estado,
      },
    };
  }

  async login(correo: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: {
        correo,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordCorrecta) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    if (!user.estado) {
      throw new UnauthorizedException(
        'El usuario está inactivo',
      );
    }

    const payload = {
      sub: user.id_usuario,
      correo: user.correo,
      rol: user.rol,
    };

    const accessToken = await this.jwtService.signAsync(
      payload,
    );

    return {
      message: 'Login exitoso',
      access_token: accessToken,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        rol: user.rol,
        estado: user.estado,
      },
    };
  }
}