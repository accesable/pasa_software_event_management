// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.0
//   protoc               v3.20.3
// source: proto/file.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "file";

export interface UploadFilesRequest {
  files: FileUpload[];
  options: UploadOptions | undefined;
}

export interface UploadOptions {
  entityId: string;
  entityType: string;
  type: string;
  field: string;
}

export interface FileUpload {
  data: Uint8Array;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface UploadFileResponse {
  fileId: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  publicId: string;
}

export interface DeleteFilesRequest {
  fileIds: string[];
}

export interface DeleteFilesResponse {
  success: boolean;
  message: string;
}

export interface UploadFilesResponse {
  files: UploadFileResponse[];
}

export const FILE_PACKAGE_NAME = "file";

/** Service định nghĩa các phương thức RPC cho file service */

export interface FileServiceProtoClient {
  uploadFiles(request: UploadFilesRequest): Observable<UploadFilesResponse>;

  deleteFiles(request: DeleteFilesRequest): Observable<DeleteFilesResponse>;
}

/** Service định nghĩa các phương thức RPC cho file service */

export interface FileServiceProtoController {
  uploadFiles(
    request: UploadFilesRequest,
  ): Promise<UploadFilesResponse> | Observable<UploadFilesResponse> | UploadFilesResponse;

  deleteFiles(
    request: DeleteFilesRequest,
  ): Promise<DeleteFilesResponse> | Observable<DeleteFilesResponse> | DeleteFilesResponse;
}

export function FileServiceProtoControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["uploadFiles", "deleteFiles"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("FileServiceProto", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("FileServiceProto", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const FILE_SERVICE_PROTO_SERVICE_NAME = "FileServiceProto";
