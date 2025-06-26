// bigc-backend/src/modules/documents/documents.controller.ts
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors, Res, Query, HttpCode, HttpStatus, BadRequestException, NotFoundException, Logger, UnauthorizedException } from '@nestjs/common'; // Importa Logger y UnauthorizedException
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../../utils/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name); // Instancia del logger

  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file')) // 'file' es el nombre del campo del formulario para el archivo
  @ApiConsumes('multipart/form-data') // Necesario para Swagger cuando hay subida de archivos
  @ApiOperation({ summary: 'Subir un nuevo documento (solo Admin/SuperAdmin)' })
  @ApiBody({
    schema: {
        type: 'object',
        properties: {
        file: {
            type: 'string',
            format: 'binary',
            description: 'Archivo a subir (PDF, DOCX, etc.)',
        },
        companyId: { 
            type: 'number', 
            example: 1, 
            description: 'ID de la compañía' 
        },
        areaId: { 
            type: 'number', 
            example: 1, 
            description: 'ID del área (opcional)',
            nullable: true 
        },
        name: { 
            type: 'string', 
            example: 'Informe Anual 2023', 
            description: 'Nombre del documento' 
        },
        description: { 
            type: 'string', 
            example: 'Informe financiero anual de la compañía.', 
            description: 'Descripción del documento',
            nullable: true 
        },
        statusId: { 
            type: 'number', 
            example: 1, 
            description: 'ID del estado del documento (e.g., 1 para Activo)' 
        },
        },
        required: ['file', 'companyId', 'name', 'statusId'],
    },
    })
  @ApiResponse({ status: 201, description: 'Documento subido exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o archivo no proporcionado.' })
  @ApiResponse({ status: 404, description: 'Entidad relacionada (Compañía, Área, Estado) no encontrada.' })
  @ApiResponse({ status: 409, description: 'Ya existe un documento con el mismo nombre en esta compañía/área.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    this.logger.debug(`Attempting to create document. User from token (req.user): ${JSON.stringify(req.user)}`); // Log clave

    if (!file) {
      throw new BadRequestException('Se requiere un archivo para subir.');
    }
    // Asegurarse de que companyId y statusId son números
    createDocumentDto.companyId = +createDocumentDto.companyId;
    createDocumentDto.statusId = +createDocumentDto.statusId;
    if (createDocumentDto.areaId) {
      createDocumentDto.areaId = +createDocumentDto.areaId;
    }

    // Asegurarse de que req.user y req.user.userName existen antes de usarlos
    const userName = req.user?.userName;
    if (!userName) {
      this.logger.error('req.user.userName is undefined. JWT payload might be incomplete.');
      throw new UnauthorizedException('No se pudo determinar el usuario autenticado.');
    }

    return this.documentsService.create(createDocumentDto, file, userName);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los documentos (todos los usuarios autenticados). Permite filtrar.' })
  @ApiQuery({ name: 'companyId', required: false, type: Number, description: 'Filtrar por ID de compañía.' })
  @ApiQuery({ name: 'areaId', required: false, type: Number, description: 'Filtrar por ID de área.' })
  @ApiQuery({ name: 'statusId', required: false, type: Number, description: 'Filtrar por ID de estado.' })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'Filtrar por ID del usuario que subió el documento.' })
  @ApiResponse({ status: 200, description: 'Lista de documentos.', type: [UpdateDocumentDto] })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('areaId') areaId?: string,
    @Query('statusId') statusId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.documentsService.findAll(
      companyId ? +companyId : undefined,
      areaId ? +areaId : undefined,
      statusId ? +statusId : undefined,
      userId ? +userId : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un documento por ID (todos los usuarios autenticados)' })
  @ApiParam({ name: 'id', description: 'ID del documento', type: Number })
  @ApiResponse({ status: 200, description: 'Detalles del documento.', type: UpdateDocumentDto })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(+id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar un documento por ID (todos los usuarios autenticados)' })
  @ApiParam({ name: 'id', description: 'ID del documento a descargar', type: Number })
  @ApiResponse({ status: 200, description: 'Descarga del archivo.' })
  @ApiResponse({ status: 404, description: 'Documento o archivo no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const document = await this.documentsService.findOne(+id);

    // Verificar si el archivo existe físicamente
    if (!document || !fs.existsSync(document.filePath)) { // También verificar si document es null
      throw new NotFoundException(`El archivo para el documento con ID ${id} no se encontró.`);
    }

    // Configurar cabeceras para la descarga
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream'); // Tipo de contenido genérico para descarga

    // Enviar el archivo
    res.sendFile(path.resolve(document.filePath));
  }

  @Put(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Actualizar un documento por ID (solo Admin/SuperAdmin)' })
  @ApiParam({ name: 'id', description: 'ID del documento a actualizar', type: Number })
  @ApiResponse({ status: 200, description: 'Documento actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Documento o entidad relacionada no encontrada.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @ApiResponse({ status: 409, description: 'Ya existe un documento con el nuevo nombre en esta compañía/área.' })
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto, @Req() req) {
    return this.documentsService.update(+id, updateDocumentDto, req.user.userName);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Eliminar un documento y su archivo (solo Admin/SuperAdmin)' })
  @ApiParam({ name: 'id', description: 'ID del documento a eliminar', type: Number })
  @ApiResponse({ status: 204, description: 'Documento eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async remove(@Param('id') id: string) {
    await this.documentsService.remove(+id);
  }
}
