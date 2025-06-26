// bigc-backend/src/modules/companies/companies.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  /**
   * Encuentra todas las compañías habilitadas.
   * @returns {Promise<Company[]>} Una lista de compañías.
   */
  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find({
      where: { enabled: true }, // Asume que quieres solo compañías habilitadas
      order: { name: 'ASC' },   // Ordena por nombre
    });
  }

  /**
   * Encuentra una compañía por su ID.
   * @param id ID de la compañía.
   * @returns {Promise<Company | null>} La compañía encontrada o null.
   */
  async findOne(id: number): Promise<Company | null> {
    return this.companiesRepository.findOne({ where: { id } });
  }

  // Puedes añadir otros métodos aquí como create, update, delete si los necesitas.
}
