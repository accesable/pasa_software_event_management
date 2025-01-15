// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.0
//   protoc               v3.20.3
// source: proto/event.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "event";

export interface Empty {
}

export interface getParticipatedEventsRequest {
  userId: string;
  status?: string | undefined;
}

export interface getOrganizedEventsRequest {
  userId: string;
  status?: string | undefined;
}

export interface IsExistEventResponse {
  isExist: boolean;
}

export interface SendEventInvitesRequest {
  eventId: string;
  emails: string[];
}

export interface SendEventInvitesResponse {
  message: string;
  success: boolean;
}

export interface UpdateEventVideoIntroRequest {
  id: string;
  videoUrl: string;
}

export interface CheckOwnerShipRequest {
  eventId: string;
  userId: string;
}

export interface CheckOwnerShipResponse {
  isOwner: boolean;
}

export interface UpdateEventFilesRequest {
  id: string;
  field: string;
  fileIds: string[];
  videoUrl: string;
  deletedFiles: string[];
}

export interface UpdateEventDocumentRequest {
  id: string;
  index: number;
  document: string;
  userId: string;
}

export interface UpdateEventDocumentResponse {
  message: string;
  event: EventType | undefined;
}

export interface CancelEventRequest {
  id: string;
  userId: string;
}

export interface CancelEventResponse {
  message: string;
}

export interface GuestResponse {
  guest: Guest | undefined;
}

export interface AllGuestResponse {
  guests: Guest[];
  meta: Meta | undefined;
}

export interface CreateGuestRequest {
  name: string;
  jobTitle: string;
  organization?: string | undefined;
  linkSocial?: string | undefined;
  avatar?: string | undefined;
}

export interface CreateSpeakerRequest {
  name: string;
  email: string;
  avatar?: string | undefined;
  phone?: string | undefined;
  jobTitle: string;
  bio?: string | undefined;
  linkFb?: string | undefined;
}

export interface SpeakerResponse {
  speaker: Speaker | undefined;
}

export interface AllSpeakerResponse {
  speakers: Speaker[];
  meta: Meta | undefined;
}

export interface FindByIdRequest {
  id: string;
}

export interface DecodeAccessResponse {
  id: string;
  email: string;
  name: string;
  avatar: string;
  oldAvatarId: string;
  phoneNumber: string;
  isActive: boolean;
  role: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  page?: number | undefined;
  limit?: number | undefined;
  totalPages?: number | undefined;
  totalItems: number;
  count: number;
}

export interface QueryParamsRequest {
  query: { [key: string]: string };
}

export interface QueryParamsRequest_QueryEntry {
  key: string;
  value: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string | undefined;
  description?: string | undefined;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | undefined;
}

export interface CategoryByIdRequest {
  id: string;
}

export interface EventByIdRequest {
  id: string;
}

export interface AllCategoryResponse {
  categories: Category[];
  meta: Meta | undefined;
}

export interface EventResponse {
  event: EventType | undefined;
}

export interface AllEventResponse {
  events: EventType[];
  meta: Meta | undefined;
}

export interface CategoryResponse {
  category: Category | undefined;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  guestIds: string[];
  categoryId: string;
  maxParticipants: number;
  banner?: string | undefined;
  videoIntro?: string | undefined;
  documents: string[];
  createdBy: CreatedBy | undefined;
  sponsors: SponsorType[];
  budget?: BudgetType | undefined;
  schedule: ScheduleWithoutId[];
}

export interface UpdateEventRequest {
  id: string;
  name?: string | undefined;
  description?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  location?: string | undefined;
  guestIds: string[];
  categoryId?: string | undefined;
  maxParticipants?: number | undefined;
  banner?: string | undefined;
  videoIntro?: string | undefined;
  documents: string[];
  status?: string | undefined;
  sponsors: SponsorType[];
  budget?: BudgetType | undefined;
  schedule: ScheduleWithoutId[];
  invitedUsers: InvitedUser[];
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  schedule: ScheduleType[];
  guestIds: string[];
  categoryId: string;
  maxParticipants: number;
  banner?: string | undefined;
  videoIntro?: string | undefined;
  documents: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: CreatedBy | undefined;
  sponsors: SponsorType[];
  budget?: BudgetType | undefined;
  invitedUsers: InvitedUser[];
}

export interface InvitedUser {
  userId: string;
  email: string;
  status?: string | undefined;
}

export interface Speaker {
  id: string;
  name: string;
  bio: string;
  linkFb: string;
  avatar: string;
  email: string;
  phone?: string | undefined;
  jobTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  name: string;
  jobTitle: string;
  organization?: string | undefined;
  linkSocial?: string | undefined;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface SponsorType {
  name: string;
  logo: string;
  website: string;
  contribution: number;
}

export interface ExpenseOrRevenueType {
  desc: string;
  amount: number;
  date: string;
}

export interface BudgetType {
  totalBudget: number;
  expenses: ExpenseOrRevenueType[];
  revenue: ExpenseOrRevenueType[];
}

export interface ScheduleWithoutId {
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  speakerIds: string[];
}

export interface ScheduleType {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  speakerIds: string[];
}

export interface CreatedBy {
  id: string;
  email: string;
}

export const EVENT_PACKAGE_NAME = "event";

export interface EventServiceClient {
  getAllEvent(request: QueryParamsRequest): Observable<AllEventResponse>;

  getEventById(request: EventByIdRequest): Observable<EventResponse>;

  getCategoryById(request: CategoryByIdRequest): Observable<CategoryResponse>;

  getAllCategory(request: Empty): Observable<AllCategoryResponse>;

  createEvent(request: CreateEventRequest): Observable<EventResponse>;

  createCategory(request: CreateCategoryRequest): Observable<CategoryResponse>;

  updateEvent(request: UpdateEventRequest): Observable<EventResponse>;

  updateCategory(request: UpdateCategoryRequest): Observable<CategoryResponse>;

  createSpeaker(request: CreateSpeakerRequest): Observable<SpeakerResponse>;

  getAllSpeaker(request: Empty): Observable<AllSpeakerResponse>;

  getAllGuest(request: Empty): Observable<AllGuestResponse>;

  createGuest(request: CreateGuestRequest): Observable<GuestResponse>;

  cancelEvent(request: CancelEventRequest): Observable<CancelEventResponse>;

  /** rpc UpdateEventDocument (UpdateEventDocumentRequest) returns (UpdateEventDocumentResponse); */

  checkOwnerShip(request: CheckOwnerShipRequest): Observable<CheckOwnerShipResponse>;

  /** rpc UpdateEventVideoIntro(UpdateEventVideoIntroRequest) returns (EventResponse); */

  sendEventInvites(request: SendEventInvitesRequest): Observable<SendEventInvitesResponse>;

  /**
   * rpc AcceptInvitation(AcceptInvitationRequest) returns (AcceptInvitationResponse);
   * rpc DeclineInvitation(DeclineInvitationRequest) returns (DeclineInvitationResponse);
   */

  isExistEvent(request: EventByIdRequest): Observable<IsExistEventResponse>;

  getOrganizedEvents(request: getOrganizedEventsRequest): Observable<AllEventResponse>;

  getParticipatedEvents(request: getParticipatedEventsRequest): Observable<AllEventResponse>;
}

export interface EventServiceController {
  getAllEvent(request: QueryParamsRequest): Promise<AllEventResponse> | Observable<AllEventResponse> | AllEventResponse;

  getEventById(request: EventByIdRequest): Promise<EventResponse> | Observable<EventResponse> | EventResponse;

  getCategoryById(
    request: CategoryByIdRequest,
  ): Promise<CategoryResponse> | Observable<CategoryResponse> | CategoryResponse;

  getAllCategory(request: Empty): Promise<AllCategoryResponse> | Observable<AllCategoryResponse> | AllCategoryResponse;

  createEvent(request: CreateEventRequest): Promise<EventResponse> | Observable<EventResponse> | EventResponse;

  createCategory(
    request: CreateCategoryRequest,
  ): Promise<CategoryResponse> | Observable<CategoryResponse> | CategoryResponse;

  updateEvent(request: UpdateEventRequest): Promise<EventResponse> | Observable<EventResponse> | EventResponse;

  updateCategory(
    request: UpdateCategoryRequest,
  ): Promise<CategoryResponse> | Observable<CategoryResponse> | CategoryResponse;

  createSpeaker(
    request: CreateSpeakerRequest,
  ): Promise<SpeakerResponse> | Observable<SpeakerResponse> | SpeakerResponse;

  getAllSpeaker(request: Empty): Promise<AllSpeakerResponse> | Observable<AllSpeakerResponse> | AllSpeakerResponse;

  getAllGuest(request: Empty): Promise<AllGuestResponse> | Observable<AllGuestResponse> | AllGuestResponse;

  createGuest(request: CreateGuestRequest): Promise<GuestResponse> | Observable<GuestResponse> | GuestResponse;

  cancelEvent(
    request: CancelEventRequest,
  ): Promise<CancelEventResponse> | Observable<CancelEventResponse> | CancelEventResponse;

  /** rpc UpdateEventDocument (UpdateEventDocumentRequest) returns (UpdateEventDocumentResponse); */

  checkOwnerShip(
    request: CheckOwnerShipRequest,
  ): Promise<CheckOwnerShipResponse> | Observable<CheckOwnerShipResponse> | CheckOwnerShipResponse;

  /** rpc UpdateEventVideoIntro(UpdateEventVideoIntroRequest) returns (EventResponse); */

  sendEventInvites(
    request: SendEventInvitesRequest,
  ): Promise<SendEventInvitesResponse> | Observable<SendEventInvitesResponse> | SendEventInvitesResponse;

  /**
   * rpc AcceptInvitation(AcceptInvitationRequest) returns (AcceptInvitationResponse);
   * rpc DeclineInvitation(DeclineInvitationRequest) returns (DeclineInvitationResponse);
   */

  isExistEvent(
    request: EventByIdRequest,
  ): Promise<IsExistEventResponse> | Observable<IsExistEventResponse> | IsExistEventResponse;

  getOrganizedEvents(
    request: getOrganizedEventsRequest,
  ): Promise<AllEventResponse> | Observable<AllEventResponse> | AllEventResponse;

  getParticipatedEvents(
    request: getParticipatedEventsRequest,
  ): Promise<AllEventResponse> | Observable<AllEventResponse> | AllEventResponse;
}

export function EventServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getAllEvent",
      "getEventById",
      "getCategoryById",
      "getAllCategory",
      "createEvent",
      "createCategory",
      "updateEvent",
      "updateCategory",
      "createSpeaker",
      "getAllSpeaker",
      "getAllGuest",
      "createGuest",
      "cancelEvent",
      "checkOwnerShip",
      "sendEventInvites",
      "isExistEvent",
      "getOrganizedEvents",
      "getParticipatedEvents",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("EventService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("EventService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const EVENT_SERVICE_NAME = "EventService";
