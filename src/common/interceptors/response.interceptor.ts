import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedPayload<T> {
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
}

export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T> | string
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T> | string> {
    return next.handle().pipe(
      map((payload: T | PaginatedPayload<T>): StandardResponse<T> | string => {
        if (typeof payload === 'string') {
          return payload;
        }

        let data: T;
        let meta: Record<string, unknown> | undefined;
        let message = 'Operación realizada con éxito';

        if (this.isPaginatedPayload(payload)) {
          data = payload.data;
          meta = payload.meta;
          message = payload.message ?? message;
        } else {
          data = payload;
        }

        return {
          success: true,
          message,
          data,
          meta,
        };
      }),
    );
  }

  private isPaginatedPayload(payload: unknown): payload is PaginatedPayload<T> {
    return (
      payload !== null &&
      typeof payload === 'object' &&
      'data' in (payload as Record<string, unknown>)
    );
  }
}
