import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

export const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException('El email ya está registrado');

    const password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    // role siempre 'user' (valor por defecto de la columna)
    return this.usersService.create({ email: dto.email, password });
  }
}
