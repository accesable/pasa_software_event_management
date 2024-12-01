// rpc-exception.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof RpcException) {
          const errorResponse = error.getError() as { message?: string; code?: number; details?: string };

          if (typeof errorResponse === 'object' && errorResponse !== null) {
            const { message, code, details } = errorResponse;

            const finalMessage = message || 'An error occurred';
            const finalDetails = details || 'No additional information available';

            if (code === 400) {
              throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                error: finalDetails,
              }, HttpStatus.BAD_REQUEST);
            }
          }
        }

        throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }),
    );
  }
}
