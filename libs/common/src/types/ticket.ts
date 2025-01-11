// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.0
//   protoc               v3.20.3
// source: proto/ticket.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "ticket";

export interface Empty {
}

export interface GetParticipantByEventIdRequest {
  eventId: string;
}

export interface GetParticipantByEventIdResponse {
  participants: DataResultCheckInOut[];
}

export interface ScanTicketResponse {
  result: DataResultCheckInOut | undefined;
}

export interface DataResultCheckInOut {
  eventId: string;
  id: string;
  email: string;
  name: string;
  phoneNumber?: string | undefined;
  checkInAt: string;
  checkOutAt?: string | undefined;
}

export interface ScanTicketRequest {
  code: string;
}

export interface ParticipationByIdRequest {
  id: string;
}

export interface QueryParamsRequest {
  query: { [key: string]: string };
}

export interface QueryParamsRequest_QueryEntry {
  key: string;
  value: string;
}

export interface CreateParticipationRequest {
  eventId: string;
  userId: string;
  sessionIds: string[];
}

export interface ParticipationResponse {
  participation: Participation | undefined;
  ticket: TicketType | undefined;
}

export interface Participation {
  id: string;
  eventId: string;
  userId: string;
  sessionIds: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string | undefined;
  checkedOutAt?: string | undefined;
}

export interface TicketResponse {
  ticket: TicketType | undefined;
}

export interface AllTicketResponse {
  tickets: TicketType[];
  meta: Meta | undefined;
}

export interface TicketByIdRequest {
  id: string;
}

export interface UpdateTicketRequest {
  id: string;
  status?: string | undefined;
  usedAt?: string | undefined;
}

export interface TicketType {
  id: string;
  participantId: string;
  qrCodeUrl: string;
  status: string;
  usedAt?: string | undefined;
}

export interface Meta {
  page?: number | undefined;
  limit?: number | undefined;
  totalPages?: number | undefined;
  totalItems: number;
  count: number;
}

export const TICKET_PACKAGE_NAME = "ticket";

export interface TicketServiceProtoClient {
  getAllTicket(request: QueryParamsRequest): Observable<AllTicketResponse>;

  getTicketById(request: TicketByIdRequest): Observable<TicketResponse>;

  updateTicket(request: UpdateTicketRequest): Observable<TicketResponse>;

  deleteTicket(request: TicketByIdRequest): Observable<TicketResponse>;

  checkIn(request: TicketByIdRequest): Observable<TicketResponse>;

  cancelTicket(request: TicketByIdRequest): Observable<TicketResponse>;

  scanTicket(request: ScanTicketRequest): Observable<ScanTicketResponse>;

  createParticipant(request: CreateParticipationRequest): Observable<ParticipationResponse>;

  getParticipantByEventId(request: GetParticipantByEventIdRequest): Observable<GetParticipantByEventIdResponse>;

  getParticipantById(request: ParticipationByIdRequest): Observable<ParticipationResponse>;

  updateParticipant(request: CreateParticipationRequest): Observable<ParticipationResponse>;

  deleteParticipant(request: ParticipationByIdRequest): Observable<Empty>;
}

export interface TicketServiceProtoController {
  getAllTicket(
    request: QueryParamsRequest,
  ): Promise<AllTicketResponse> | Observable<AllTicketResponse> | AllTicketResponse;

  getTicketById(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse;

  updateTicket(request: UpdateTicketRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse;

  deleteTicket(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse;

  checkIn(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse;

  cancelTicket(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse;

  scanTicket(
    request: ScanTicketRequest,
  ): Promise<ScanTicketResponse> | Observable<ScanTicketResponse> | ScanTicketResponse;

  createParticipant(
    request: CreateParticipationRequest,
  ): Promise<ParticipationResponse> | Observable<ParticipationResponse> | ParticipationResponse;

  getParticipantByEventId(
    request: GetParticipantByEventIdRequest,
  ):
    | Promise<GetParticipantByEventIdResponse>
    | Observable<GetParticipantByEventIdResponse>
    | GetParticipantByEventIdResponse;

  getParticipantById(
    request: ParticipationByIdRequest,
  ): Promise<ParticipationResponse> | Observable<ParticipationResponse> | ParticipationResponse;

  updateParticipant(
    request: CreateParticipationRequest,
  ): Promise<ParticipationResponse> | Observable<ParticipationResponse> | ParticipationResponse;

  deleteParticipant(request: ParticipationByIdRequest): Promise<Empty> | Observable<Empty> | Empty;
}

export function TicketServiceProtoControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getAllTicket",
      "getTicketById",
      "updateTicket",
      "deleteTicket",
      "checkIn",
      "cancelTicket",
      "scanTicket",
      "createParticipant",
      "getParticipantByEventId",
      "getParticipantById",
      "updateParticipant",
      "deleteParticipant",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("TicketServiceProto", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("TicketServiceProto", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const TICKET_SERVICE_PROTO_SERVICE_NAME = "TicketServiceProto";
