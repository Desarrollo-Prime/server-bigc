import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator'; // Importa la clave
import { UserRoleEnum } from '../../utils/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos para la ruta
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles definidos para la ruta, permitir el acceso
    if (!requiredRoles) {
      return true;
    }

    // Obtener el usuario del request (que viene del JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      return false; // No hay usuario o roles, denegar acceso
    }

    // Verificar si alguno de los roles del usuario coincide con los roles requeridos
    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));

    return hasRequiredRole;
  }
}