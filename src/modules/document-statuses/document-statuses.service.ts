// bigc-backend/src/modules/document-statuses/document-statuses.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentStatus } from '../../entities/document-status.entity';

@Injectable()
export class DocumentStatusesService {
  constructor(
    @InjectRepository(DocumentStatus)
    private documentStatusesRepository: Repository<DocumentStatus>,
  ) {}

  /**
   * Encuentra todos los estados de documento.
   * @returns {Promise<DocumentStatus[]>} Una lista de estados de documento.
   */
  async findAll(): Promise<DocumentStatus[]> {
    return this.documentStatusesRepository.find({
      order: { name: 'ASC' }, // Ordena por nombre
    });
  }

  /**
   * Encuentra un estado de documento por su ID.
   * @param id ID del estado de documento.
   * @returns {Promise<DocumentStatus | null>} El estado de documento encontrado o null.
   */
  async findOne(id: number): Promise<DocumentStatus | null> {
    return this.documentStatusesRepository.findOne({ where: { id } });
  }
}
