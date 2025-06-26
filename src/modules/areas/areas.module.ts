import { Module } from '@nestjs/common';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from '../../entities/area.entity';
import { Company } from '../../entities/company.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Area, Company]), // Importa las entidades
    AuthModule, // Para usar Guards de autenticación y autorización
  ],
  providers: [AreasService],
  controllers: [AreasController],
  exports: [AreasService],
})
export class AreasModule {}