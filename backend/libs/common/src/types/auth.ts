// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.0
//   protoc               v3.20.3
// source: proto/auth.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "auth";

export interface Empty {
}

export interface GetUserWithFaceImagesResponse {
  userId: string;
  faceImages: string[];
}

/** Thêm message mới */
export interface UpdateUserFaceImagesRequest {
  id: string;
  faceImages: string[];
}

export interface findUsersByIdsRequest {
  ids: string[];
}

export interface Forgot {
  user: UserResponse | undefined;
}

export interface findUsersByIdsResponse {
  users: UserForParticipant[];
}

export interface ResetPassRequest {
  id: string;
  password: string;
}

export interface QueryParamsRequest {
  query: { [key: string]: string };
}

export interface QueryParamsRequest_QueryEntry {
  key: string;
  value: string;
}

export interface EmailRequest {
  email: string;
}

export interface ChangePasswordRequest {
  id: string;
  currentPassword: string;
  newPassword: string;
}

export interface AllUserResponse {
  users: UserResponse[];
  meta: Meta | undefined;
}

export interface FindByIdRequest {
  id: string;
}

export interface UpdateAvatarRequest {
  avatar: string;
  oldAvatarId: string;
  id: string;
  previousAvatarId: string;
}

export interface GoogleAuthRequest {
  name: string;
  email: string;
  picture: string;
  accessToken: string;
}

export interface UpdateProfileRequest {
  name: string;
  phoneNumber: string;
  password: string;
  accessToken: string;
}

export interface AccessTokenRequest {
  refreshToken: string;
}

export interface GeneralResponse {
  user: UserResponse | undefined;
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  accessToken: string;
}

export interface LogoutResponse {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: UserResponse | undefined;
}

export interface ProfileRespone {
  user: UserResponse | undefined;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatar: string;
  phoneNumber: string;
  isActive: boolean;
  role: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
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

export interface UserForParticipant {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
}

export const AUTH_PACKAGE_NAME = "auth";

export interface UsersServiceClient {
  getAllUser(request: QueryParamsRequest): Observable<AllUserResponse>;

  findById(request: FindByIdRequest): Observable<DecodeAccessResponse>;

  findByEmailWithoutPassword(request: EmailRequest): Observable<Forgot>;

  login(request: LoginRequest): Observable<GeneralResponse>;

  register(request: RegisterRequest): Observable<RegisterResponse>;

  accessToken(request: AccessTokenRequest): Observable<GeneralResponse>;

  handleLogout(request: LogoutRequest): Observable<LogoutResponse>;

  handleGoogleAuth(request: GoogleAuthRequest): Observable<GeneralResponse>;

  updateProfile(request: UpdateProfileRequest): Observable<ProfileRespone>;

  updateAvatar(request: UpdateAvatarRequest): Observable<ProfileRespone>;

  changePassword(request: ChangePasswordRequest): Observable<Empty>;

  resetPassword(request: ResetPassRequest): Observable<Empty>;

  findUsersByIds(request: findUsersByIdsRequest): Observable<findUsersByIdsResponse>;

  updateUserFaceImages(request: UpdateUserFaceImagesRequest): Observable<ProfileRespone>;

  getUserWithFaceImages(request: FindByIdRequest): Observable<GetUserWithFaceImagesResponse>;
}

export interface UsersServiceController {
  getAllUser(request: QueryParamsRequest): Promise<AllUserResponse> | Observable<AllUserResponse> | AllUserResponse;

  findById(
    request: FindByIdRequest,
  ): Promise<DecodeAccessResponse> | Observable<DecodeAccessResponse> | DecodeAccessResponse;

  findByEmailWithoutPassword(request: EmailRequest): Promise<Forgot> | Observable<Forgot> | Forgot;

  login(request: LoginRequest): Promise<GeneralResponse> | Observable<GeneralResponse> | GeneralResponse;

  register(request: RegisterRequest): Promise<RegisterResponse> | Observable<RegisterResponse> | RegisterResponse;

  accessToken(request: AccessTokenRequest): Promise<GeneralResponse> | Observable<GeneralResponse> | GeneralResponse;

  handleLogout(request: LogoutRequest): Promise<LogoutResponse> | Observable<LogoutResponse> | LogoutResponse;

  handleGoogleAuth(
    request: GoogleAuthRequest,
  ): Promise<GeneralResponse> | Observable<GeneralResponse> | GeneralResponse;

  updateProfile(request: UpdateProfileRequest): Promise<ProfileRespone> | Observable<ProfileRespone> | ProfileRespone;

  updateAvatar(request: UpdateAvatarRequest): Promise<ProfileRespone> | Observable<ProfileRespone> | ProfileRespone;

  changePassword(request: ChangePasswordRequest): Promise<Empty> | Observable<Empty> | Empty;

  resetPassword(request: ResetPassRequest): Promise<Empty> | Observable<Empty> | Empty;

  findUsersByIds(
    request: findUsersByIdsRequest,
  ): Promise<findUsersByIdsResponse> | Observable<findUsersByIdsResponse> | findUsersByIdsResponse;

  updateUserFaceImages(
    request: UpdateUserFaceImagesRequest,
  ): Promise<ProfileRespone> | Observable<ProfileRespone> | ProfileRespone;

  getUserWithFaceImages(
    request: FindByIdRequest,
  ): Promise<GetUserWithFaceImagesResponse> | Observable<GetUserWithFaceImagesResponse> | GetUserWithFaceImagesResponse;
}

export function UsersServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getAllUser",
      "findById",
      "findByEmailWithoutPassword",
      "login",
      "register",
      "accessToken",
      "handleLogout",
      "handleGoogleAuth",
      "updateProfile",
      "updateAvatar",
      "changePassword",
      "resetPassword",
      "findUsersByIds",
      "updateUserFaceImages",
      "getUserWithFaceImages",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UsersService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UsersService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USERS_SERVICE_NAME = "UsersService";
