import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../../utils/constants';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Areas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crear una nueva área (solo Admin/SuperAdmin)' })
  @ApiResponse({ status: 201, description: 'Área creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'Ya existe un área con el mismo nombre para esa compañía.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async create(@Body() createAreaDto: CreateAreaDto, @Req() req) {
    return this.areasService.create(createAreaDto, req.user.userName);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las áreas (todos los usuarios autenticados). Opcionalmente filtrar por companyId.' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filtrar áreas por ID de compañía.', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de áreas.', type: [UpdateAreaDto] })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll(@Query('companyId') companyId?: string) {
    return this.areasService.findAll(companyId ? +companyId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un área por ID (todos los usuarios autenticados)' })
  @ApiParam({ name: 'id', description: 'ID del área', type: Number })
  @ApiResponse({ status: 200, description: 'Detalles del área.', type: UpdateAreaDto })
  @ApiResponse({ status: 404, description: 'Área no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findOne(@Param('id') id: string) {
    return this.areasService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Actualizar un área por ID (solo Admin/SuperAdmin)' })
  @ApiParam({ name: 'id', description: 'ID del área a actualizar', type: Number })
  @ApiResponse({ status: 200, description: 'Área actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Área no encontrada.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @ApiResponse({ status: 409, description: 'Ya existe un área con el nuevo nombre para esa compañía.' })
  async update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto, @Req() req) {
    return this.areasService.update(+id, updateAreaDto, req.user.userName);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Eliminar un área por ID (solo SuperAdmin)' })
  @ApiParam({ name: 'id', description: 'ID del área a eliminar', type: Number })
  @ApiResponse({ status: 204, description: 'Área eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Área no encontrada.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async remove(@Param('id') id: string) {
    await this.areasService.remove(+id);
  }
}
