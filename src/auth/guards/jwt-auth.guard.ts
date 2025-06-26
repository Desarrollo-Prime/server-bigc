import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Opcional: puedes personalizar el manejo de errores de autenticación aquí
  handleRequest(err: any, user: any, info: any) { // Añadir tipos para claridad
    if (err || !user) {
      throw err || new UnauthorizedException('No autorizado: Token inválido o expirado.');
    }
    return user;
  }
}