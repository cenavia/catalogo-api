import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Role } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthUser } from '../interfaces/jwt-payload.interface';

// Debe ejecutarse DESPUÉS de JwtAuthGuard (necesita request.user).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Metadatos del método; si no hay, los de la clase.
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true; // ruta sin @Roles

    const user = context.switchToHttp().getRequest<Request>().user as
      AuthUser | undefined;
    return !!user && required.includes(user.role); // false -> 403 Forbidden
  }
}
