// bigc-backend/src/modules/companies/companies.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Asume que tienes un guard JWT

@ApiTags('companies') // Agrupa los endpoints de compañías en Swagger
@Controller('companies') // Define el prefijo de la ruta para este controlador: /api/companies
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @ApiBearerAuth('JWT-auth') // Indica que este endpoint requiere autenticación JWT
  @UseGuards(JwtAuthGuard) // Protege este endpoint con el guard JWT
  @Get()
  @ApiResponse({ status: 200, description: 'Lista de todas las compañías.' })
  async findAll() {
    return this.companiesService.findAll();
  }
}
