// bigc-backend/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRoleEnum } from '../../utils/constants'; // Asegúrate de importar UserRoleEnum

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 1. Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.get<UserRoleEnum[]>('roles', context.getHandler());

    if (!requiredRoles) {
      this.logger.debug('No specific roles required for this route. Access granted.');
      return true; // Si no se especifican roles, permite el acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // El objeto de usuario adjunto por JwtStrategy

    this.logger.debug(`RolesGuard: User (req.user): ${JSON.stringify(user)}`);
    this.logger.debug(`RolesGuard: Required roles: ${JSON.stringify(requiredRoles)}`);

    if (!user || !user.roles) {
      this.logger.warn('RolesGuard: User or user roles not found on request. Denying access.');
      return false; // Si no hay usuario o roles, deniega el acceso
    }

    // 2. Verificar si el usuario tiene al menos uno de los roles requeridos
    const hasRole = requiredRoles.some(role => user.roles.includes(role));

    if (!hasRole) {
      this.logger.warn(`RolesGuard: User ${user.userName} (Roles: ${user.roles}) does not have any of the required roles: ${requiredRoles}. Access denied.`);
    } else {
      this.logger.debug(`RolesGuard: User ${user.userName} (Roles: ${user.roles}) has a required role. Access granted.`);
    }

    return hasRole;
  }
}
