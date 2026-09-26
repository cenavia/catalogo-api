import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SALT_ROUNDS } from './auth.service';

// Crea un admin de demo al arrancar (idempotente): no hay endpoint para "hacerse admin".
@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const plain = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !plain) return;

    if (await this.usersService.findByEmail(email)) return;

    const password = await bcrypt.hash(plain, SALT_ROUNDS);
    await this.usersService.create({ email, password, role: 'admin' });
    this.logger.log(`Admin de demo creado: ${email}`);
  }
}
