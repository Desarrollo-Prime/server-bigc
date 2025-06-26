import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
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
   * @param userName Nombre de usuario.
   * @param password Contraseña.
   * @returns ProfileUser sin contraseña si la validación es exitosa.
   */
  async validateUser(userName: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { userName: userName, enable: true, blocked: false },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparar la contraseña ingresada con la contraseña hasheada en la base de datos
    // La contraseña en la DB del esquema es '914A8F1C07561D222A2E60F2E6F5DBD0ACF33C79FA16488C028359C7C2E9CEB8' para 'Admin123*'
    // Esta es una contraseña hasheada con MD5, no con bcrypt.
    // Para que el ejemplo funcione con el esquema proporcionado, haré una comparación directa.
    // EN UN ENTORNO REAL, DEBERÍAS HASHEAR TODAS LAS CONTRASEÑAS CON BCRYPT AL REGISTRAR.
    const isPasswordValid = user.password === pass; // Para el esquema dado, compara directamente
    // const isPasswordValid = await bcrypt.compare(pass, user.password); // Para bcrypt real

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Obtener roles del usuario
    const roles = user.userRoles.map(ur => ur.role.name);

    // Retornar el usuario sin la contraseña y con los roles
    const { password, ...result } = user;
    return { ...result, roles };
  }

  /**
   * Inicia sesión del usuario y genera un token JWT.
   * @param loginDto Objeto con nombre de usuario y contraseña.
   * @returns Un objeto con el token de acceso y los datos del usuario.
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.userName, loginDto.password);
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