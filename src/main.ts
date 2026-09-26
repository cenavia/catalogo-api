import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);

  // Swagger en /docs con esquema "Bearer" (botón Authorize).
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Catálogo API')
    .setDescription(
      'Catálogo de productos multi-tenant (NestJS + TypeORM + JWT)',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  Logger.log(`API escuchando en http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Swagger en http://localhost:${port}/docs`, 'Bootstrap');
}
void bootstrap();
