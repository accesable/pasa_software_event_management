// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.0
//   protoc               v3.20.3
// source: proto/report.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";

export const protobufPackage = "report";

export const REPORT_PACKAGE_NAME = "report";

export interface ReportServiceProtoClient {
}

export interface ReportServiceProtoController {
}

export function ReportServiceProtoControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ReportServiceProto", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ReportServiceProto", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const REPORT_SERVICE_PROTO_SERVICE_NAME = "ReportServiceProto";
