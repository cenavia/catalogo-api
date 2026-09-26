import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

// Si el handler no responde en REQUEST_TIMEOUT_MS -> 408 Request Timeout.
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly ms: number;

  constructor(config: ConfigService) {
    this.ms = config.get<number>('REQUEST_TIMEOUT_MS', 5000);
  }

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.ms),
      catchError((err: unknown) =>
        throwError(() =>
          err instanceof TimeoutError ? new RequestTimeoutException() : err,
        ),
      ),
    );
  }
}
