import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ProfileUser } from '../../entities/profile-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../../entities/user-role.entity';
import { Role } from '../../entities/role.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(ProfileUser)
    private usersRepository: Repository<ProfileUser>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'supersecretkey',
    });
  }

  /**
   * Valida el payload del JWT y adjunta el usuario al request.
   * @param payload Payload decodificado del JWT.
   * @returns El objeto de usuario para adjuntar al request (req.user).
   */
  async validate(payload: any) {
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub, enable: true, blocked: false },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo/bloqueado.');
    }

    // Asegurarse de que los roles se adjunten al objeto de usuario validado
    const roles = user.userRoles.map(ur => ur.role.name);
    return {
      userId: user.id,
      userName: user.userName,
      companyId: user.companyId,
      roles: roles,
    };
  }
}