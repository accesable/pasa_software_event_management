import { HttpStatus, Logger } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

export function handleRpcException(error: any, defaultMessage: string): RpcException {
  if (error instanceof RpcException || error.code !== 500) {
      return error;
  }
  return new RpcException({
      message: error.message || defaultMessage,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
  });
}