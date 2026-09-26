import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  // Dobles de prueba: sin BD ni JWT reales.
  const usersService = { findByEmail: jest.fn(), create: jest.fn() };
  const jwtService = { signAsync: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('crea el usuario con la contraseña hasheada (bcrypt, 10 rounds)', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation((data: Partial<User>) =>
        Promise.resolve({ id: 'u1', role: 'user', ...data }),
      );

      const user = await service.register({
        email: 'ana@demo.com',
        password: 'Secreta123',
      });

      const [[saved]] = usersService.create.mock.calls as [[User]];
      expect(saved.password).not.toBe('Secreta123');
      expect(bcrypt.getRounds(saved.password)).toBe(10);
      await expect(bcrypt.compare('Secreta123', saved.password)).resolves.toBe(
        true,
      );
      expect(user.email).toBe('ana@demo.com');
    });

    it('lanza ConflictException si el email ya existe', async () => {
      usersService.findByEmail.mockResolvedValue({ id: 'u1' });
      await expect(
        service.register({ email: 'ana@demo.com', password: 'Secreta123' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const plain = 'Secreta123';
    let stored: User;

    beforeAll(async () => {
      stored = {
        id: 'u1',
        email: 'ana@demo.com',
        role: 'user',
        password: await bcrypt.hash(plain, 10),
      } as User;
    });

    it('devuelve { accessToken } con credenciales correctas', async () => {
      usersService.findByEmail.mockResolvedValue(stored);
      jwtService.signAsync.mockResolvedValue('token.firmado');

      await expect(
        service.login({ email: stored.email, password: plain }),
      ).resolves.toEqual({ accessToken: 'token.firmado' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'ana@demo.com',
        role: 'user',
      });
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      usersService.findByEmail.mockResolvedValue(stored);
      await expect(
        service.login({ email: stored.email, password: 'mala' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException si el email no existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nadie@demo.com', password: plain }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
