import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';

// @Roles('admin') guarda metadatos que luego lee RolesGuard con el Reflector.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
