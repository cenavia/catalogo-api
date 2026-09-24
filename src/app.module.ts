import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ConfigService inyectable en cualquier módulo
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validate,
    }),
  ],
  controllers: [AppController],
  providers: [
    // ValidationPipe global registrado como provider: también aplica en los tests e2e.
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // elimina propiedades sin decoradores
        forbidNonWhitelisted: true, // ...y además responde 400 si llegan
        transform: true, // convierte el payload a la clase DTO (y tipos primitivos)
      }),
    },
  ],
})
export class AppModule {}