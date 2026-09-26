import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

// Registra "MÉTODO /ruta STATUS - Nms" de cada petición HTTP.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const { method, originalUrl } = http.getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = http.getResponse<Response>();
          this.logger.log(
            `${method} ${originalUrl} ${statusCode} - ${Date.now() - start}ms`,
          );
        },
        // En error el status aún no está en la respuesta: lo sacamos de la excepción.
        error: (err: unknown) => {
          const status = err instanceof HttpException ? err.getStatus() : 500;
          this.logger.warn(
            `${method} ${originalUrl} ${status} - ${Date.now() - start}ms`,
          );
        },
      }),
    );
  }
}
