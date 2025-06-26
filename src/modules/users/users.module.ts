import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUser } from '../../entities/profile-user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { Role } from '../../entities/role.entity';
import { AuthModule } from '../../auth/auth.module'; // Importar AuthModule para JwtAuthGuard y RolesGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileUser, UserRole, Role]), // Importa las entidades
    AuthModule, // Importa AuthModule para usar sus Guards
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // Exportar si otros módulos necesitan usar UserService
})
export class UsersModule {}