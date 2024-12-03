import { Controller, Body, Request, UseGuards, UseFilters, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public, } from 'apps/auth/src/decorators/public.decorator';
import { AccessTokenRequest, AccessTokenResponse, Empty, GoogleAuthRequest, LoginResponse, LogoutRequest, UsersServiceController, UsersServiceControllerMethods } from '@app/common';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { Observable } from 'rxjs';
import { GrpcJwtInterceptor } from 'apps/auth/src/core/jwt.interceptor';

@Controller()
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  constructor(private readonly usersService: UsersService) { }

  handleGoogleAuth(request: GoogleAuthRequest) {
    return this.usersService.handleGoogleAuth(request);
  }

  accessToken(request: AccessTokenRequest) {
    return this.usersService.accessToken(request.refreshToken);
  }

  register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @UseInterceptors(GrpcJwtInterceptor)
  handleLogout(@Body() accessToken: LogoutRequest) {
    return this.usersService.handleLogout(accessToken);
  }
}
