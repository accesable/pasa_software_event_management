import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Metadata } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class GrpcJwtInterceptor implements NestInterceptor {
  constructor(private jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = context.switchToRpc().getData();
    const token = metadata.accessToken // Lấy token từ metadata
    if (!token) {
      throw new RpcException({
        message: 'Unauthorized',
        code: HttpStatus.UNAUTHORIZED,
      });
    }

    const payload = this.jwtService.verify(token);
    // Lưu payload vào context để có thể sử dụng ở các handler sau
    context.switchToRpc().getData().user = payload;

    return next.handle();
  }
}
