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
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof BadRequestException || error instanceof UnprocessableEntityException) {
          throw error;
        }

        if (error.hasOwnProperty('code')) {
          const rpcError = new RpcException({
            message: error.details || error.message,
            code: error.code,
          });
          
          const errorResponse = rpcError.getError() as { message?: string; code?: number; details?: string };
          const { message, code, details } = errorResponse;
          const finalMessage = message || 'An error occurred';
          const finalDetails = details || finalMessage.split(':')[0].trim() || 'No additional information available';
          
          throw new HttpException(
            {
              statusCode: code,
              error: finalDetails,
              path: context.getArgs()[0].url,
            },
            code,
          );
        }

        if (error instanceof RpcException) {
          const errorResponse = error.getError() as { message?: string; code?: number; details?: string };
          const { message, code, details } = errorResponse;
          const finalMessage = message || 'An error occurred';
          const finalDetails = details || finalMessage.split(':')[0].trim() || 'No additional information available';
          
          throw new HttpException({
            statusCode: 400,
            error: finalDetails,
            path: context.getArgs()[0].url,
          }, HttpStatus.BAD_REQUEST);
        }

        throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }),
    );
  }
}
