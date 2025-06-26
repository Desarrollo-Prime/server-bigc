// bigc-backend/src/auth/auth.module.ts
import { Module, Logger } from '@nestjs/common'; // Importar Logger
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ProfileUser } from '../entities/profile-user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileUser, UserRole, Role]),
    PassportModule,
    JwtModule.registerAsync({ // Usar registerAsync para inyectar ConfigService
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') || 'supersecretkey';
        const expiresIn = '8h'; // Duración extendida para pruebas
        Logger.log(`[AuthModule] JWT_SECRET used for signing tokens: ${secret ? '*****' : 'DEFAULT_SECRET_USED'} (length: ${secret.length})`, 'JwtModule');
        Logger.log(`[AuthModule] Token will expire in: ${expiresIn}`, 'JwtModule');
        return {
          secret: secret,
          signOptions: { expiresIn: expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule, // Importar ConfigModule para que esté disponible
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, TypeOrmModule.forFeature([ProfileUser, UserRole, Role])], // Exportar JwtModule para que otros módulos puedan usarlo
})
export class AuthModule {}
