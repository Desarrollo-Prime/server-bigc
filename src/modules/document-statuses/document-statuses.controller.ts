// bigc-backend/src/modules/document-statuses/document-statuses.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DocumentStatusesService } from './document-statuses.service';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Asume que tienes un guard JWT

@ApiTags('document-statuses') // Agrupa los endpoints de estados de documento en Swagger
@Controller('document-statuses') // Define el prefijo de la ruta para este controlador: /api/document-statuses
export class DocumentStatusesController {
  constructor(private readonly documentStatusesService: DocumentStatusesService) {}

  @ApiBearerAuth('JWT-auth') // Indica que este endpoint requiere autenticación JWT
  @UseGuards(JwtAuthGuard) // Protege este endpoint con el guard JWT
  @Get()
  @ApiResponse({ status: 200, description: 'Lista de todos los estados de documento.' })
  async findAll() {
    return this.documentStatusesService.findAll();
  }
}
