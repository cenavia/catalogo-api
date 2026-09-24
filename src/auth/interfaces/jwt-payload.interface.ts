import type { Role } from '../../users/entities/user.entity';

// Lo que viaja firmado dentro del token.
export interface JwtPayload {
  sub: string; // id del usuario (claim estándar "subject")
  email: string;
  role: Role;
}

// Lo que la estrategia JWT deja en request.user.
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
