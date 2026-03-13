import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const isObject = data !== null && typeof data === 'object';
        const hasDataField = isObject && 'data' in data;

        return {
          success: true,
          message:
            (isObject && (data as any).message) ||
            'Operación realizada con éxito',
          data: hasDataField ? (data as any).data : data,
          meta: isObject ? (data as any).meta : undefined,
        };
      }),
    );
  }
}
