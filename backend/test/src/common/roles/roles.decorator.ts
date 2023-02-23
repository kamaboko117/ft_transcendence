import { SetMetadata } from '@nestjs/common';
import { ListRoles } from './roles.enum';

export const ROLES_KEYS = 'roles';
export const Roles = (...roles: ListRoles[]) => SetMetadata(ROLES_KEYS, roles);