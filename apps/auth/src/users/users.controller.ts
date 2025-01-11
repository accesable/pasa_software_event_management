import { Controller, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { Observable } from 'rxjs';
import { UsersServiceControllerMethods, UsersServiceController, GoogleAuthRequest, GeneralResponse, LogoutRequest, ChangePasswordRequest, EmailRequest, FindByIdRequest, findUsersByIdsRequest, LoginRequest, QueryParamsRequest, RegisterRequest, ResetPassRequest, UpdateAvatarRequest, UpdateProfileRequest } from '../../../../libs/common/src';

@Controller()
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  constructor(private readonly usersService: UsersService) { }

  findUsersByIds(request: findUsersByIdsRequest) {
    return this.usersService.findUsersByIds(request.ids);
  }

  resetPassword(request: ResetPassRequest) {
    return this.usersService.resetPassword(request.id, request.password);
  }

  findByEmailWithoutPassword(request: EmailRequest) {
    return this.usersService.findByEmailWithoutPassword(request.email);
  }

  getAllUser(request: QueryParamsRequest) {
    return this.usersService.getAllUser(request.query);
  }

  changePassword(request: ChangePasswordRequest) {
    return this.usersService.changePassword(request);
  }

  updateAvatar(request: UpdateAvatarRequest) {
    return this.usersService.updateAvatar(request);
  }

  findById(request: FindByIdRequest) {
    return this.usersService.findById(request.id);
  }

  handleGoogleAuth(request: GoogleAuthRequest) {
    return this.usersService.handleGoogleAuth(request);
  }

  accessToken(request: GeneralResponse) {
    return this.usersService.accessToken(request.refreshToken);
  }

  register(@Body() registerDto: RegisterRequest) {
    return this.usersService.register(registerDto);
  }

  login(@Body() loginDto: LoginRequest) {
    return this.usersService.login(loginDto);
  }

  handleLogout(@Body() accessToken: LogoutRequest) {
    return this.usersService.handleLogout(accessToken);
  }

  updateProfile(@Body() data: UpdateProfileRequest) {
    return this.usersService.updateProfile(data);
  }
}
