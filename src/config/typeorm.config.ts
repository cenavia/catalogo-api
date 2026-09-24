import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Única pieza que conoce el motor de BD: si mañana cambias a MySQL,
// solo tocas este archivo (type/driver) y las variables DB_*.
export const typeOrmConfigFactory = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.getOrThrow<string>('DB_HOST'),
  port: config.getOrThrow<number>('DB_PORT'),
  username: config.getOrThrow<string>('DB_USERNAME'),
  password: config.getOrThrow<string>('DB_PASSWORD'),
  database: config.getOrThrow<string>('DB_NAME'),
  autoLoadEntities: true, // registra las entidades de cada TypeOrmModule.forFeature()
  synchronize: config.get<boolean>('DB_SYNC', false), // NUNCA true en producción
});