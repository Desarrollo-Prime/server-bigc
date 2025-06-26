import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Document } from '../../entities/document.entity';
import { Company } from '../../entities/company.entity';
import { Area } from '../../entities/area.entity';
import { ProfileUser } from '../../entities/profile-user.entity';
import { DocumentStatus } from '../../entities/document-status.entity';
import { DocumentPermission } from '../../entities/document-permission.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
    @InjectRepository(ProfileUser)
    private usersRepository: Repository<ProfileUser>,
    @InjectRepository(DocumentStatus)
    private documentStatusRepository: Repository<DocumentStatus>,
    @InjectRepository(DocumentPermission)
    private documentPermissionRepository: Repository<DocumentPermission>,
  ) {}

  /**
   * Crea un nuevo documento y guarda el archivo.
   * @param createDocumentDto Datos del documento.
   * @param file Objeto de archivo de Multer.
   * @param createdBy Usuario que realiza la creación.
   * @returns El documento creado.
   */
  async create(createDocumentDto: CreateDocumentDto, file: Express.Multer.File, createdBy: string): Promise<Document> {
    const { companyId, areaId, name, description, statusId } = createDocumentDto;

    // Validar existencia de entidades relacionadas
    const company = await this.companiesRepository.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException(`Compañía con ID ${companyId} no encontrada.`);

    if (areaId) {
      const area = await this.areasRepository.findOne({ where: { id: areaId } });
      if (!area) throw new NotFoundException(`Área con ID ${areaId} no encontrada.`);
    }

    const user = await this.usersRepository.findOne({ where: { userName: createdBy } });
    if (!user) throw new NotFoundException(`Usuario creador '${createdBy}' no encontrado.`);

    const status = await this.documentStatusRepository.findOne({ where: { id: statusId } });
    if (!status) throw new NotFoundException(`Estado de documento con ID ${statusId} no encontrado.`);

    // Verificar si ya existe un documento con el mismo nombre y en la misma área/compañía
    const where: FindOptionsWhere<Document> = {
      name,
      companyId,
      areaId: areaId ? areaId : undefined, // Usar undefined en lugar de null
    };
    
    const existingDocument = await this.documentsRepository.findOne({ where });
    if (existingDocument) {
      throw new ConflictException(`Ya existe un documento con el nombre "${name}" en esta compañía/área.`);
    }

    const newDocument = this.documentsRepository.create({
      companyId,
      areaId: areaId || undefined,
      userId: user.id, // Asigna el ID del usuario que subió
      name,
      description,
      fileName: file.originalname,
      fileExtension: path.extname(file.originalname),
      filePath: file.path, // Ruta donde Multer guardó el archivo
      statusId,
      createdBy,
      modifiedBy: createdBy,
      createdDate: new Date(),
      modifiedDate: new Date(),
    });

    return await this.documentsRepository.save(newDocument);
  }

  /**
   * Obtiene todos los documentos, opcionalmente filtrados.
   * @param companyId (Opcional) ID de la compañía.
   * @param areaId (Opcional) ID del área.
   * @param statusId (Opcional) ID del estado.
   * @param userId (Opcional) ID del usuario que subió el documento.
   * @returns Lista de documentos.
   */
  async findAll(companyId?: number, areaId?: number, statusId?: number, userId?: number): Promise<Document[]> {
    const where: FindOptionsWhere<Document> = {};
    if (companyId) where.companyId = companyId;
    if (areaId) where.areaId = areaId;
    if (statusId) where.statusId = statusId;
    if (userId) where.userId = userId;

    return this.documentsRepository.find({
      where,
      relations: ['company', 'area', 'user', 'status'],
    });
  }

  /**
   * Obtiene un documento por su ID.
   * @param id ID del documento.
   * @returns El documento encontrado.
   */
  async findOne(id: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['company', 'area', 'user', 'status', 'documentPermissions', 'documentPermissions.role'],
    });
    if (!document) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado.`);
    }
    return document;
  }

  /**
   * Actualiza un documento existente.
   * @param id ID del documento a actualizar.
   * @param updateDocumentDto Datos a actualizar.
   * @param modifiedBy Usuario que realiza la modificación.
   * @returns El documento actualizado.
   */
  async update(id: number, updateDocumentDto: UpdateDocumentDto, modifiedBy: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado.`);
    }

    // Validar existencia de entidades relacionadas si se actualizan y el valor ha cambiado
    if (updateDocumentDto.companyId !== undefined && updateDocumentDto.companyId !== document.companyId) {
      const company = await this.companiesRepository.findOne({ where: { id: updateDocumentDto.companyId } });
      if (!company) throw new NotFoundException(`Compañía con ID ${updateDocumentDto.companyId} no encontrada.`);
    }
    if (updateDocumentDto.areaId !== undefined && updateDocumentDto.areaId !== document.areaId) {
      const area = await this.areasRepository.findOne({ where: { id: updateDocumentDto.areaId } });
      if (!area) throw new NotFoundException(`Área con ID ${updateDocumentDto.areaId} no encontrada.`);
    }
    if (updateDocumentDto.statusId !== undefined && updateDocumentDto.statusId !== document.statusId) {
      const status = await this.documentStatusRepository.findOne({ where: { id: updateDocumentDto.statusId } });
      if (!status) throw new NotFoundException(`Estado de documento con ID ${updateDocumentDto.statusId} no encontrado.`);
    }

    // Verificar si el nuevo nombre ya existe para la misma compañía/área (si el nombre, compañía o área cambian)
    if (updateDocumentDto.name !== undefined && updateDocumentDto.name !== document.name ||
      updateDocumentDto.companyId !== undefined && updateDocumentDto.companyId !== document.companyId ||
      updateDocumentDto.areaId !== undefined && updateDocumentDto.areaId !== document.areaId) {

      const targetCompanyId = updateDocumentDto.companyId ?? document.companyId;
      const targetAreaId = updateDocumentDto.areaId ?? document.areaId;
      const targetName = updateDocumentDto.name ?? document.name;

      const where: FindOptionsWhere<Document> = {
        name: targetName,
        companyId: targetCompanyId,
      };
      
      if (targetAreaId !== undefined) {
        where.areaId = targetAreaId;
      }

      const existingDocument = await this.documentsRepository.findOne({ where });
      if (existingDocument && existingDocument.id !== id) {
        throw new ConflictException(`Ya existe un documento con el nombre "${targetName}" en esta compañía/área.`);
      }
    }

    Object.assign(document, updateDocumentDto);
    document.modifiedBy = modifiedBy;
    document.modifiedDate = new Date();

    return this.documentsRepository.save(document);
  }

  /**
   * Elimina un documento y su archivo físico.
   * @param id ID del documento a eliminar.
   * @returns `true` si se eliminó con éxito.
   */
  async remove(id: number): Promise<boolean> {
    const document = await this.documentsRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado.`);
    }

    // Eliminar las entradas en DocumentPermission relacionadas
    await this.documentPermissionRepository.delete({ documentId: id });

    // Eliminar el archivo físico
    if (fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (error) {
        console.error(`Error al eliminar el archivo ${document.filePath}:`, error);
      }
    }

    const result = await this.documentsRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}