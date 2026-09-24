import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

// Describe (y valida) las variables de entorno que la app necesita.
class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number = 3000;

  // --- Base de datos ---
  @IsString()
  DB_HOST: string;

  @IsInt()
  DB_PORT: number = 5432;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsBoolean()
  DB_SYNC: boolean = false;
}

// ConfigModule llama a esta función al arrancar: si falta algo, la app NO arranca.
export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(
    EnvironmentVariables,
    {
      ...config,
      // enableImplicitConversion convertiría "false" en true: lo parseamos a mano
      // (solo el texto exacto "true" activa synchronize; si falta, queda en false).
      DB_SYNC: config.DB_SYNC === 'true',
    },
    { enableImplicitConversion: true }, // "3000" (string) -> 3000 (number)
  );
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Configuración inválida:\n${errors.toString()}`);
  }
  return validated;
}