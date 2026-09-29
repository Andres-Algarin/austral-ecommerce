import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /*
   * Se consulta el usuario en cada petición para que
   * desactivarlo o cambiarle el rol tenga efecto inmediato,
   * sin esperar a que venza el token.
   */
  async validate(payload: {
    sub: number;
    correo: string;
    rol: string;
  }) {
    const user = await this.usersRepository.findOne({
      where: {
        id_usuario: payload.sub,
      },
      select: {
        id_usuario: true,
        correo: true,
        rol: true,
        estado: true,
      },
    });

    if (!user || !user.estado) {
      throw new UnauthorizedException(
        'El usuario no existe o está inactivo',
      );
    }

    return {
      id_usuario: user.id_usuario,
      correo: user.correo,
      rol: user.rol,
    };
  }
}
