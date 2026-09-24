import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard reutilizable: @UseGuards(JwtAuthGuard) -> 401 si no hay token válido.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
