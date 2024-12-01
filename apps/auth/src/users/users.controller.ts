import { Controller, Body, Request, UseGuards, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public, ResponseMessage, } from 'apps/auth/src/decorators/public.decorator';
import { LoginRequest, LoginResponse, RegisterRequest, UsersServiceController, UsersServiceControllerMethods } from '@app/common';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { Observable } from 'rxjs';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';

@Controller()
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Public()
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }
}
