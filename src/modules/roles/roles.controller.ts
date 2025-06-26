// bigc-backend/src/modules/roles/roles.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Asume que tienes un guard JWT

@ApiTags('roles') // Agrupa los endpoints de roles en Swagger
@Controller('roles') // Define el prefijo de la ruta para este controlador: /api/roles
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiBearerAuth('JWT-auth') // Indica que este endpoint requiere autenticación JWT
  @UseGuards(JwtAuthGuard) // Protege este endpoint con el guard JWT
  @Get()
  @ApiResponse({ status: 200, description: 'Lista de todos los roles.' })
  async findAll() {
    return this.rolesService.findAll();
  }
}
