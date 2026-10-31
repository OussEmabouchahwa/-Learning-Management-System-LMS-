import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@dars/contracts';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T> | T> {
    return next.handle().pipe(
      map((res) => {
        // If response is already wrapped or is undefined/null/buffer/stream
        if (
          res === null ||
          res === undefined ||
          typeof res !== 'object' ||
          Buffer.isBuffer(res) ||
          'data' in res
        ) {
          return res;
        }

        return {
          data: res,
        };
      }),
    );
  }
}
