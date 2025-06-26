import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../../utils/constants';

export const ROLES_KEY = 'roles'; // Clave para los metadatos de roles
export const Roles = (...roles: UserRoleEnum[]) => SetMetadata(ROLES_KEY, roles);