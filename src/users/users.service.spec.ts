import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it('create construye y guarda la entidad', async () => {
    const data = { email: 'a@a.com', password: 'hash' };
    repo.create.mockReturnValue(data);
    repo.save.mockResolvedValue({ id: 'u1', ...data });
    await expect(service.create(data)).resolves.toMatchObject({ id: 'u1' });
    expect(repo.save).toHaveBeenCalledWith(data);
  });

  it('findAll ordena por email', async () => {
    repo.find.mockResolvedValue([]);
    await service.findAll();
    expect(repo.find).toHaveBeenCalledWith({ order: { email: 'ASC' } });
  });

  it('findByEmail y findById consultan por el campo correcto', async () => {
    repo.findOne.mockResolvedValue(null);
    await service.findByEmail('a@a.com');
    await service.findById('u1');
    expect(repo.findOne).toHaveBeenNthCalledWith(1, {
      where: { email: 'a@a.com' },
    });
    expect(repo.findOne).toHaveBeenNthCalledWith(2, { where: { id: 'u1' } });
  });

  it('remove lanza NotFoundException si no existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove elimina el usuario existente', async () => {
    const user = { id: 'u1' } as User;
    repo.findOne.mockResolvedValue(user);
    await service.remove('u1');
    expect(repo.remove).toHaveBeenCalledWith(user);
  });
});
