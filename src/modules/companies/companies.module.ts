// bigc-backend/src/modules/companies/companies.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../../entities/company.entity'; // Importa la entidad Company
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]), // Asegura que la entidad Company esté disponible
  ],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService], // Exporta CompaniesService si otros módulos lo van a inyectar
})
export class CompaniesModule {}
