import { Injectable, NotFoundException, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileUser } from '../../entities/profile-user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum } from '../../utils/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(ProfileUser)
    private usersRepository: Repository<ProfileUser>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto, createdBy: string): Promise<Omit<ProfileUser, 'password' | 'userRoles'> & { roles: string[] }> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: createUserDto.email }, { userName: createUserDto.userName }],
    });
    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Ya existe un usuario con este correo electrónico.');
      }
      if (existingUser.userName === createUserDto.userName) {
        throw new ConflictException('Ya existe un usuario con este nombre de usuario.');
      }
    }

    const role = await this.rolesRepository.findOne({ where: { name: createUserDto.roleName } });
    if (!role) {
      throw new BadRequestException(`El rol '${createUserDto.roleName}' no es válido.`);
    }

    const hashedPassword = createUserDto.password;

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      createdBy: createdBy,
      modifiedBy: createdBy,
      createdDate: new Date(),
      modifiedDate: new Date(),
      enable: true,
      blocked: false,
    });

    const savedUser = await this.usersRepository.save(newUser);

    const userRole = this.userRolesRepository.create({
      userId: savedUser.id,
      roleId: role.id,
      createdBy: createdBy,
      modifiedBy: createdBy,
      createdDate: new Date(),
      modifiedDate: new Date(),
    });
    await this.userRolesRepository.save(userRole);

    return this.findOne(savedUser.id);
  }

  async findAll(): Promise<Array<Omit<ProfileUser, 'password' | 'userRoles'> & { roles: string[] }>> {
    const users = await this.usersRepository.find({
      relations: ['company', 'userRoles', 'userRoles.role'],
    });

    return users.map(user => {
      const { password, userRoles, ...userData } = user;
      return {
        ...userData,
        roles: user.userRoles.map(ur => ur.role.name)
      };
    });
  }

  async findOne(id: number): Promise<Omit<ProfileUser, 'password' | 'userRoles'> & { roles: string[] }> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company', 'userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    const { password, userRoles, ...userData } = user;
    return {
      ...userData,
      roles: user.userRoles.map(ur => ur.role.name)
    };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    modifiedBy: string,
    currentRoles: string[]
  ): Promise<Omit<ProfileUser, 'password' | 'userRoles'> & { roles: string[] }> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    if (updateUserDto.email !== undefined && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email: updateUserDto.email } });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Ya existe otro usuario con este correo electrónico.');
      }
    }
    
    if (updateUserDto.userName !== undefined && updateUserDto.userName !== user.userName) {
      const existingUser = await this.usersRepository.findOne({ where: { userName: updateUserDto.userName } });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Ya existe otro usuario con este nombre de usuario.');
      }
    }

    Object.assign(user, updateUserDto);
    user.modifiedBy = modifiedBy;
    user.modifiedDate = new Date();

    if (updateUserDto.password !== undefined) {
        user.password = updateUserDto.password;
    }

    if (updateUserDto.roleName !== undefined) {
      if (!currentRoles.includes(UserRoleEnum.SUPER_ADMIN)) {
        throw new UnauthorizedException('Solo un SuperAdministrador puede cambiar el rol de un usuario.');
      }

      const newRole = await this.rolesRepository.findOne({ where: { name: updateUserDto.roleName } });
      if (!newRole) {
        throw new BadRequestException(`El rol '${updateUserDto.roleName}' no es válido.`);
      }

      await this.userRolesRepository.delete({ userId: user.id });
      const newUserRole = this.userRolesRepository.create({
        userId: user.id,
        roleId: newRole.id,
        createdBy: modifiedBy,
        modifiedBy: modifiedBy,
        createdDate: new Date(),
        modifiedDate: new Date(),
      });
      await this.userRolesRepository.save(newUserRole);
    }

    await this.usersRepository.save(user);
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    await this.userRolesRepository.delete({ userId: id });
    const result = await this.usersRepository.delete(id);
    return (result.affected ?? 0) > 0;
    }
}