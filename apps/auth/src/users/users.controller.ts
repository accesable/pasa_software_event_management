import { Controller, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { GeneralResponse, GoogleAuthRequest, LogoutRequest, UsersServiceController, UsersServiceControllerMethods } from '@app/common';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { AllUserResponse, ChangePasswordRequest, EmailRequest, Empty, FindByIdRequest, ProfileRespone, QueryParamsRequest, UpdateAvatarRequest, UpdateProfileRequest, UpgradeUserRequest } from '@app/common/types/auth';
import { Observable } from 'rxjs';
import { EventPattern } from '@nestjs/microservices';

@Controller()
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  constructor(private readonly usersService: UsersService) { }

  findByEmailWithoutPassword(request: EmailRequest) {
    return this.usersService.findByEmailWithoutPassword(request.email);
  }

  getAllUser(request: QueryParamsRequest) {
    return this.usersService.getAllUser(request.query);
  }

  upgradeUser(request: UpgradeUserRequest) {
    return this.usersService.upgradeUser(request);
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

  register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  handleLogout(@Body() accessToken: LogoutRequest) {
    return this.usersService.handleLogout(accessToken);
  }

  updateProfile(@Body() data: UpdateProfileRequest) {
    return this.usersService.updateProfile(data);
  }
}
