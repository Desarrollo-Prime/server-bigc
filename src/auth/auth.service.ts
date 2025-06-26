// bigc-backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileUser } from '../entities/profile-user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserRoleEnum } from '../utils/constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(ProfileUser)
    private usersRepository: Repository<ProfileUser>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida las credenciales del usuario y devuelve el usuario si son válidas.
   * Se usa para el login inicial con usuario/contraseña.
   * @param userName Nombre de usuario.
   * @param password Contraseña.
   * @returns ProfileUser sin contraseña y con roles si la validación es exitosa.
   */
  async validateUserCredentials(userName: string, pass: string): Promise<any> {
    const user = await this.usersRepository.createQueryBuilder('profileUser')
      .leftJoinAndSelect('profileUser.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .where('profileUser.userName = :userName', { userName })
      .andWhere('profileUser.enable = :enable', { enable: true })
      .andWhere('profileUser.blocked = :blocked', { blocked: false })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const roles = user.userRoles?.map(ur => ur.role.name) || [];
    const { password, ...result } = user;
    return { ...result, roles };
  }

  /**
   * Busca y devuelve un usuario por nombre de usuario, incluyendo sus roles.
   * Utilizado por la estrategia JWT para cargar los datos del usuario después de la validación del token.
   * @param userName Nombre de usuario.
   * @returns ProfileUser sin contraseña y con roles, o null si no se encuentra/está inactivo/bloqueado.
   */
  async findUserForJwtValidation(userName: string): Promise<any | null> {
    const user = await this.usersRepository.createQueryBuilder('profileUser')
      .leftJoinAndSelect('profileUser.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .where('profileUser.userName = :userName', { userName })
      .andWhere('profileUser.enable = :enable', { enable: true })
      .andWhere('profileUser.blocked = :blocked', { blocked: false })
      .getOne();

    if (!user) {
      return null;
    }

    const roles = user.userRoles?.map(ur => ur.role.name) || [];
    const { password, ...result } = user;
    return { ...result, roles };
  }

  /**
   * Inicia sesión del usuario y genera un token JWT.
   * @param loginDto Objeto con nombre de usuario y contraseña.
   * @returns Un objeto con el token de acceso y los datos del usuario.
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUserCredentials(loginDto.userName, loginDto.password); // Usar el método de credenciales
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas o usuario inactivo/bloqueado.');
    }

    const payload = {
      userName: user.userName,
      sub: user.id,
      roles: user.roles,
      companyId: user.companyId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        companyId: user.companyId,
      },
    };
  }
}
