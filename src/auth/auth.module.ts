import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // Corrección aquí: Eliminado el 'C' extra
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUser } from '../entities/profile-user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileUser, UserRole, Role]), // Importa las entidades necesarias
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'supersecretkey', // Usar una clave secreta fuerte y desde env
        signOptions: { expiresIn: '1h' }, // Token expira en 1 hora
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule], // Exporta AuthService y JwtModule para usar en otros módulos
})
export class AuthModule {}