import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

// Capa de acceso a usuarios: el resto de módulos NUNCA usa el repositorio directamente.
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  create(data: Pick<User, 'email' | 'password'> & Partial<User>) {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  findAll() {
    return this.usersRepo.find({ order: { email: 'ASC' } });
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    await this.usersRepo.remove(user);
  }
}