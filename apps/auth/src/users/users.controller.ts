import { Controller, Body, Request, UseGuards, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public, } from 'apps/auth/src/decorators/public.decorator';
import { AccessTokenRequest, AccessTokenResponse, Empty, LogoutRequest, UsersServiceController, UsersServiceControllerMethods } from '@app/common';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { Observable } from 'rxjs';

@Controller()
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  constructor(private readonly usersService: UsersService) { }

  accessToken(request: AccessTokenRequest) {
    return this.usersService.accessToken(request.refreshToken);
  }

  @Public()
  register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Public()
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  handleLogout(@Body() accessToken: LogoutRequest) {
    return this.usersService.handleLogout(accessToken);
  }
}
