// bigc-backend/src/auth/strategies/jwt.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'supersecretkey'; // Usar una constante para el secreto
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.logger.log(`[JwtStrategy] JWT_SECRET used for verifying tokens: ${secret ? '*****' : 'DEFAULT_SECRET_USED'} (length: ${secret.length})`);
  }

  async validate(payload: any) {
    this.logger.debug(`[JwtStrategy] Validating JWT payload: ${JSON.stringify(payload)}`);

    const user = await this.authService.findUserForJwtValidation(payload.userName); 

    if (!user) {
      this.logger.warn(`[JwtStrategy] User with userName ${payload.userName} not found or invalid during JWT validation (e.g., disabled/blocked).`);
      throw new UnauthorizedException('Token inválido o usuario inactivo/bloqueado.');
    }

    this.logger.debug(`[JwtStrategy] User successfully validated via JWT: ${user.userName}, Roles: ${user.roles}`);
    return user; // Este objeto se adjuntará a `req.user`
  }
}
