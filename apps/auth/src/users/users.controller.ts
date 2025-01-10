import { Controller, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { GeneralResponse, GoogleAuthRequest, LogoutRequest, UsersServiceController, UsersServiceControllerMethods } from '@app/common';
import { AllUserResponse, ChangePasswordRequest, EmailRequest, Empty, FindByIdRequest, LoginRequest, ProfileRespone, QueryParamsRequest, RegisterRequest, ResetPassRequest, UpdateAvatarRequest, UpdateProfileRequest } from '@app/common/types/auth';

@Controller()
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  constructor(private readonly usersService: UsersService) { }

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
