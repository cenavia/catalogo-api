import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AuthUser, JwtPayload } from '../interfaces/jwt-payload.interface';

// Estrategia 'jwt': lee el Bearer token, verifica firma/expiración y llama a validate().
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Se consulta la BD: si el usuario fue borrado, su token deja de servir.
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('Usuario no existe');
    return { id: user.id, email: user.email, role: user.role }; // -> request.user
  }
}
