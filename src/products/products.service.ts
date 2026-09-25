import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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

  // 404 si no existe; 403 si existe pero es de otro usuario.
  async findOneOwned(id: number, ownerId: string): Promise<Product> {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    if (product.owner.id !== ownerId) {
      throw new ForbiddenException('No eres el propietario de este producto');
    }
    return product;
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

  async update(id: number, dto: UpdateProductDto, ownerId: string) {
    const product = await this.findOneOwned(id, ownerId);
    Object.assign(product, dto); // el DTO no permite tocar owner ni id
    return this.productsRepo.save(product);
  }

  async remove(id: number, ownerId: string): Promise<void> {
    const product = await this.findOneOwned(id, ownerId);
    await this.productsRepo.remove(product);
  }
}
