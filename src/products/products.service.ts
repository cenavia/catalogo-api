import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  // Aislamiento por propietario: solo los productos del usuario del token.
  findAllByOwner(ownerId: string) {
    return this.productsRepo.find({
      where: { owner: { id: ownerId } },
      order: { id: 'ASC' },
    });
  }

  async create(dto: CreateProductDto, ownerId: string) {
    const product = this.productsRepo.create({
      ...dto,
      owner: { id: ownerId } as User, // basta la referencia por id
    });
    const saved = await this.productsRepo.save(product);
    // Relee para devolver el owner completo (eager).
    return this.productsRepo.findOneOrFail({ where: { id: saved.id } });
  }
}
