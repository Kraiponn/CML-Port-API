import { SetMetadata } from '@nestjs/common';
import { RoleTypes, ROLES_KEY } from 'src/utils';

export const Roles = (...roles: RoleTypes[]) => SetMetadata(ROLES_KEY, roles);
