import { HttpStatus } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

export function handleRpcException(error: any, defaultMessage: string): RpcException {
    if (error instanceof RpcException) {
        return error;
    }
    return new RpcException({
        message: error.message || defaultMessage,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
    });
}

// handleRpcException(error: any, defaultMessage: string): RpcException {
//   if (error instanceof RpcException) {
//     return error;
//   }
//   return new RpcException({
//     message: error.message || defaultMessage,
//     code: HttpStatus.INTERNAL_SERVER_ERROR,
//   });
// }