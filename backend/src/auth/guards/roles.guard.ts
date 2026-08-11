import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredRoles) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    console.log('==============================');
    console.log('ROLES REQUERIDOS:', requiredRoles);
    console.log('USUARIO RECIBIDO:', user);
    console.log('ROL DEL USUARIO:', user?.rol);
    console.log('==============================');

    if (!user) {
      throw new ForbiddenException(
        'No se encontró el usuario autenticado',
      );
    }

    if (!requiredRoles.includes(user.rol)) {
      throw new ForbiddenException(
        `Rol no permitido. Requerido: ${requiredRoles.join(', ')}. Usuario: ${user.rol}`,
      );
    }

    return true;
  }
}