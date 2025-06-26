// bigc-backend/src/modules/document-statuses/document-statuses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentStatus } from '../../entities/document-status.entity'; // Importa la entidad DocumentStatus
import { DocumentStatusesService } from './document-statuses.service';
import { DocumentStatusesController } from './document-statuses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentStatus]), // Asegura que la entidad DocumentStatus esté disponible
  ],
  providers: [DocumentStatusesService],
  controllers: [DocumentStatusesController],
  exports: [DocumentStatusesService], // Exporta DocumentStatusesService si otros módulos lo van a inyectar
})
export class DocumentStatusesModule {}
