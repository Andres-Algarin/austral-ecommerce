import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { MailService, escapeHtml } from '../mail/mail.service';

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,

    private readonly jwtService: JwtService,

    private readonly config: ConfigService,

    private readonly mailService: MailService,
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

    return {
      message: 'Login exitoso',
      ...(await this.issueTokens(user)),
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

  // ============================================================
  // REFRESH TOKEN
  //
  // Cada refresh token sirve una sola vez: al usarlo se revoca
  // y se entrega uno nuevo (rotación). Si alguien presenta un
  // token ya revocado, se asume que fue robado y se cierran
  // todas las sesiones del usuario.
  // ============================================================

  async refresh(refreshToken: string) {
    const invalido = new UnauthorizedException(
      'Sesión expirada. Inicia sesión nuevamente.',
    );

    const registro =
      await this.refreshTokensRepository.findOne({
        where: {
          token: hashToken(refreshToken),
        },
      });

    if (!registro) {
      throw invalido;
    }

    // Revocación atómica: si otra petición ya lo usó,
    // affected será 0.
    const resultado =
      await this.refreshTokensRepository.update(
        {
          id_token: registro.id_token,
          revocado: false,
        },
        {
          revocado: true,
        },
      );

    if (!resultado.affected) {
      await this.revokeAllForUser(registro.id_usuario);
      throw invalido;
    }

    if (registro.expira_en.getTime() < Date.now()) {
      throw invalido;
    }

    const user = await this.usersRepository.findOne({
      where: {
        id_usuario: registro.id_usuario,
      },
    });

    if (!user || !user.estado) {
      throw invalido;
    }

    return await this.issueTokens(user);
  }

  async logout(refreshToken: string) {
    await this.refreshTokensRepository.update(
      {
        token: hashToken(refreshToken),
      },
      {
        revocado: true,
      },
    );

    return {
      message: 'Sesión cerrada correctamente',
    };
  }

  async revokeAllForUser(id_usuario: number) {
    await this.refreshTokensRepository.update(
      {
        id_usuario,
        revocado: false,
      },
      {
        revocado: true,
      },
    );
  }

  // ============================================================
  // RECUPERAR CONTRASEÑA
  //
  // El token de recuperación se firma con JWT_SECRET + el hash
  // actual de la contraseña: en cuanto la contraseña cambia,
  // el enlace deja de servir (un solo uso) sin guardar nada.
  // ============================================================

  async forgotPassword(correo: string) {
    const respuesta = {
      message:
        'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    };

    const user = await this.usersRepository.findOne({
      where: {
        correo,
      },
    });

    if (!user || !user.estado) {
      return respuesta;
    }

    const token = await this.jwtService.signAsync(
      {
        sub: user.id_usuario,
        purpose: 'reset',
      },
      {
        secret: this.resetSecret(user),
        expiresIn: '30m',
      },
    );

    const enlace = `${this.mailService.frontendUrl}/restablecer-contrasena?token=${encodeURIComponent(token)}`;

    await this.mailService.send({
      para: user.correo,
      asunto: 'Restablece tu contraseña',
      html: `
        <p>Hola ${escapeHtml(user.nombre)},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="${enlace}">Haz clic aquí para crear una nueva contraseña</a></p>
        <p>El enlace vence en 30 minutos. Si no fuiste tú, ignora este correo.</p>
      `,
    });

    return respuesta;
  }

  async resetPassword(token: string, password: string) {
    const invalido = new BadRequestException(
      'El enlace de recuperación no es válido o ya expiró.',
    );

    const payload = this.jwtService.decode<{
      sub?: number;
      purpose?: string;
    } | null>(token);

    if (!payload?.sub || payload.purpose !== 'reset') {
      throw invalido;
    }

    const user = await this.usersRepository.findOne({
      where: {
        id_usuario: payload.sub,
      },
    });

    if (!user || !user.estado) {
      throw invalido;
    }

    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.resetSecret(user),
      });
    } catch {
      throw invalido;
    }

    user.password_hash = await bcrypt.hash(password, 10);

    await this.usersRepository.save(user);
    await this.revokeAllForUser(user.id_usuario);

    return {
      message:
        'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
    };
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async issueTokens(user: User) {
    const access_token = await this.jwtService.signAsync({
      sub: user.id_usuario,
      correo: user.correo,
      rol: user.rol,
    });

    const refresh_token = randomBytes(48).toString('base64url');

    const dias = Number(
      this.config.get('REFRESH_TOKEN_DAYS', 7),
    );

    await this.refreshTokensRepository.save(
      this.refreshTokensRepository.create({
        id_usuario: user.id_usuario,
        token: hashToken(refresh_token),
        expira_en: new Date(
          Date.now() + dias * 24 * 60 * 60 * 1000,
        ),
        revocado: false,
      }),
    );

    return {
      access_token,
      refresh_token,
    };
  }

  private resetSecret(user: User) {
    return (
      this.config.getOrThrow<string>('JWT_SECRET') +
      user.password_hash
    );
  }
}
