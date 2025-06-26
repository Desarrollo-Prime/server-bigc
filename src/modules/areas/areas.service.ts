import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from '../../entities/area.entity';
import { Company } from '../../entities/company.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  /**
   * Crea una nueva área.
   * @param createAreaDto Datos del área a crear.
   * @param createdBy Usuario que realiza la creación.
   * @returns El área creada.
   */
  async create(createAreaDto: CreateAreaDto, createdBy: string): Promise<Area> {
    const { companyId, name, description } = createAreaDto;

    // Verificar si la compañía existe
    const company = await this.companiesRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException(`Compañía con ID ${companyId} no encontrada.`);
    }

    // Verificar si ya existe un área con el mismo nombre para la misma compañía
    const existingArea = await this.areasRepository.findOne({
      where: { companyId, name },
    });
    if (existingArea) {
      throw new ConflictException(`Ya existe un área con el nombre "${name}" para la compañía con ID ${companyId}.`);
    }

    const newArea = this.areasRepository.create({
      companyId,
      name,
      description,
      createdBy,
      modifiedBy: createdBy,
      createdDate: new Date(),
      modifiedDate: new Date(),
    });
    return this.areasRepository.save(newArea);
  }

  /**
   * Obtiene todas las áreas, opcionalmente filtradas por CompanyId.
   * @param companyId (Opcional) ID de la compañía para filtrar.
   * @returns Lista de áreas.
   */
  async findAll(companyId?: number): Promise<Area[]> {
    const findOptions: any = { relations: ['company'] };
    if (companyId) {
      findOptions.where = { companyId };
    }
    return this.areasRepository.find(findOptions);
  }

  /**
   * Obtiene un área por su ID.
   * @param id ID del área.
   * @returns El área encontrada.
   */
  async findOne(id: number): Promise<Area> {
    const area = await this.areasRepository.findOne({ where: { id }, relations: ['company'] });
    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada.`);
    }
    return area;
  }

  /**
   * Actualiza un área existente.
   * @param id ID del área a actualizar.
   * @param updateAreaDto Datos a actualizar.
   * @param modifiedBy Usuario que realiza la modificación.
   * @returns El área actualizada.
   */
  async update(id: number, updateAreaDto: UpdateAreaDto, modifiedBy: string): Promise<Area> {
    const area = await this.areasRepository.findOne({ where: { id } });
    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada.`);
    }

    // Usar el operador de encadenamiento opcional (?) y el operador de coalescencia nula (??) para manejar propiedades opcionales
    if (updateAreaDto.companyId !== undefined && updateAreaDto.companyId !== area.companyId) {
        const company = await this.companiesRepository.findOne({ where: { id: updateAreaDto.companyId } });
        if (!company) {
            throw new NotFoundException(`Compañía con ID ${updateAreaDto.companyId} no encontrada.`);
        }
    }

    // Verificar si el nuevo nombre ya existe para la misma compañía (si el nombre cambia)
    if (updateAreaDto.name !== undefined && updateAreaDto.name !== area.name) {
        const existingArea = await this.areasRepository.findOne({
            where: {
                companyId: updateAreaDto.companyId ?? area.companyId, // Usar nuevo companyId si se proporciona, de lo contrario el actual
                name: updateAreaDto.name,
            },
        });
        if (existingArea && existingArea.id !== id) {
            throw new ConflictException(`Ya existe un área con el nombre "${updateAreaDto.name}" para la compañía especificada.`);
        }
    }

    Object.assign(area, updateAreaDto);
    area.modifiedBy = modifiedBy;
    area.modifiedDate = new Date();

    return this.areasRepository.save(area);
  }

  /**
   * Elimina un área por su ID.
   * @param id ID del área a eliminar.
   * @returns `true` si se eliminó con éxito.
   */
  async remove(id: number): Promise<boolean> {
    const result = await this.areasRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Área con ID ${id} no encontrada.`);
    }
    return true;
  }
}
