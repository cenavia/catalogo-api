import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

// supertest tipa res.body como any: declaramos la forma esperada.
type TokenBody = { accessToken: string };
type ProductBody = { id: number; owner: Record<string, unknown> };

// Flujo real contra PostgreSQL (BD catalogo_test, ver .env.test):
// register -> login -> GET /products con el token emitido por la API.
describe('Auth + Products (e2e)', () => {
  let app: INestApplication<App>;
  let tokenAna: string;
  let tokenLuis: string;
  let productoAnaId: number;

  const ana = { email: 'ana@e2e.com', password: 'Secreta123' };
  const luis = { email: 'luis@e2e.com', password: 'Secreta123' };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule], // mismos pipes/guards/interceptores globales que en producción
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // BD limpia en cada ejecución: borra y recrea el esquema.
    await app.get(DataSource).synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register crea el usuario sin exponer la password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(ana)
      .expect(201);

    expect(res.body).toMatchObject({ email: ana.email, role: 'user' });
    expect(res.body).not.toHaveProperty('password');
  });

  it('POST /auth/login devuelve un accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(ana)
      .expect(200);

    const body = res.body as TokenBody;
    expect(typeof body.accessToken).toBe('string');
    tokenAna = body.accessToken;
  });

  it('GET /products sin token -> 401', () => {
    return request(app.getHttpServer()).get('/products').expect(401);
  });

  it('GET /products con token -> 200 y lista vacía', () => {
    return request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${tokenAna}`)
      .expect(200)
      .expect([]);
  });

  it('POST /products crea un producto del usuario autenticado', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${tokenAna}`)
      .send({ name: 'Teclado', price: 49.9, stock: 3 })
      .expect(201);

    expect(res.body).toMatchObject({ name: 'Teclado', price: 49.9 });
    const body = res.body as ProductBody;
    expect(body.owner.email).toBe(ana.email);
    expect(body.owner).not.toHaveProperty('password');
    productoAnaId = body.id;
  });

  it('otro usuario no ve ni puede borrar el producto (aislamiento)', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(luis);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send(luis)
      .expect(200);
    tokenLuis = (login.body as TokenBody).accessToken;

    await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${tokenLuis}`)
      .expect(200)
      .expect([]);

    await request(app.getHttpServer())
      .delete(`/products/${productoAnaId}`)
      .set('Authorization', `Bearer ${tokenLuis}`)
      .expect(403);
  });

  it('GET /users con rol user -> 403', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tokenAna}`)
      .expect(403);
  });
});
