import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  // Repositorio simulado: solo los métodos que usa el servicio.
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const OWNER = 'owner-1';
  const OTHER = 'otro-2';
  const product = (): Product =>
    ({
      id: 1,
      name: 'Teclado',
      price: 49.9,
      stock: 10,
      owner: { id: OWNER } as User,
    }) as Product;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repo },
      ],
    }).compile();
    service = moduleRef.get(ProductsService);
  });

  it('findAllByOwner filtra por owner.id', async () => {
    repo.find.mockResolvedValue([product()]);
    await service.findAllByOwner(OWNER);
    expect(repo.find).toHaveBeenCalledWith({
      where: { owner: { id: OWNER } },
      order: { id: 'ASC' },
    });
  });

  it('create asigna como owner al usuario del token', async () => {
    repo.create.mockImplementation((data: Partial<Product>) => data);
    repo.save.mockResolvedValue({ id: 1 });
    repo.findOneOrFail.mockResolvedValue(product());

    const result = await service.create(
      { name: 'Teclado', price: 49.9 },
      OWNER,
    );

    expect(repo.create).toHaveBeenCalledWith({
      name: 'Teclado',
      price: 49.9,
      owner: { id: OWNER },
    });
    expect(result.owner.id).toBe(OWNER);
  });

  it('findOneOwned lanza NotFoundException si no existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOneOwned(99, OWNER)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findOneOwned devuelve el producto si es del usuario', async () => {
    repo.findOne.mockResolvedValue(product());
    await expect(service.findOneOwned(1, OWNER)).resolves.toMatchObject({
      id: 1,
    });
  });

  it('update aplica los cambios si es el propietario', async () => {
    repo.findOne.mockResolvedValue(product());
    repo.save.mockImplementation((p: Product) => Promise.resolve(p));
    const updated = await service.update(1, { price: 39.9 }, OWNER);
    expect(updated.price).toBe(39.9);
  });

  it('update rechaza con ForbiddenException si el producto es de otro usuario', async () => {
    repo.findOne.mockResolvedValue(product());
    await expect(service.update(1, { price: 1 }, OTHER)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('remove rechaza con ForbiddenException si el producto es de otro usuario', async () => {
    repo.findOne.mockResolvedValue(product());
    await expect(service.remove(1, OTHER)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('remove elimina si es el propietario', async () => {
    const p = product();
    repo.findOne.mockResolvedValue(p);
    await service.remove(1, OWNER);
    expect(repo.remove).toHaveBeenCalledWith(p);
  });
});
