// bigc-backend/src/modules/roles/roles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  /**
   * Encuentra todos los roles habilitados.
   * @returns {Promise<Role[]>} Una lista de roles.
   */
  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      where: { enable: true }, // Corrección: 'Enable' a 'enable' (camelCase)
      order: { name: 'ASC' },  // Corrección: 'Name' a 'name' (camelCase)
    });
  }

  /**
   * Encuentra un rol por su nombre.
   * @param name Nombre del rol.
   * @returns {Promise<Role | null>} El rol encontrado o null. (Corrección: 'undefined' a 'null')
   */
  async findByName(name: string): Promise<Role | null> { // Corrección del tipo de retorno
    return this.rolesRepository.findOne({ where: { name: name } }); // Corrección: 'Name' a 'name' (camelCase)
  }

  // Puedes añadir otros métodos aquí como findOneById, create, update, delete si los necesitas.
}
