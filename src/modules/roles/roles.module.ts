// bigc-backend/src/modules/roles/roles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../entities/role.entity'; // Importa la entidad Role
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]), // Asegura que la entidad Role esté disponible en este módulo
  ],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService], // Exporta RolesService si otros módulos lo van a inyectar
})
export class RolesModule {}
