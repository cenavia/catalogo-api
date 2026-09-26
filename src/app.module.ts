import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { validate } from './config/env.validation';
import { typeOrmConfigFactory } from './config/typeorm.config';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ConfigService inyectable en cualquier módulo
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validate,
    }),
    // forRootAsync: espera a que ConfigModule haya cargado el .env
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    // Límite: 5 peticiones / 60 s por IP. Solo se aplica donde se use ThrottlerGuard.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    UsersModule,
    ProductsModule,
    AuthModule,
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
    // Interceptores globales: se ejecutan en el orden en que se registran.
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    // Aplica @Exclude()/@Expose() de class-transformer a TODAS las respuestas.
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
