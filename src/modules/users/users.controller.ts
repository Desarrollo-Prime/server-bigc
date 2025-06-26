import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../../utils/constants';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth') // Indica que esta API requiere autenticación JWT
@UseGuards(JwtAuthGuard, RolesGuard) // Protege todas las rutas en este controlador
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Registrar un nuevo usuario (solo Admin/SuperAdmin)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'El correo electrónico o nombre de usuario ya existen.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async create(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.usersService.create(createUserDto, req.user.userName);
  }

  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios (solo Admin/SuperAdmin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios.', type: [UpdateUserDto] }) // Usar UpdateUserDto como ejemplo de estructura de respuesta
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener un usuario por ID (solo Admin/SuperAdmin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 200, description: 'Detalles del usuario.', type: UpdateUserDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Actualizar un usuario por ID (Admin/SuperAdmin). SuperAdmin puede cambiar roles.' })
  @ApiParam({ name: 'id', description: 'ID del usuario a actualizar', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado (incluye intentos de cambio de rol por no-SuperAdmin).' })
  @ApiResponse({ status: 409, description: 'El correo electrónico o nombre de usuario ya existen en otro usuario.' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req) {
    return this.usersService.update(+id, updateUserDto, req.user.userName, req.user.roles);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Eliminar un usuario por ID (solo SuperAdmin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar', type: Number })
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(+id);
  }
}