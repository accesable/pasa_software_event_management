import { LoginDto } from './dto/login';
import { Controller, Post, Body, Request, UseGuards, HttpCode, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public, ResponseMessage, User } from 'apps/auth/src/decorators/public.decorator';
import { LocalAuthGuard } from 'apps/auth/src/users/guards/local-auth.guard';
import { Response, Request as ExpressRequest } from 'express';
import {RegisterRequest, UserResponse, UsersServiceController, UsersServiceControllerMethods } from '@app/common';
import { Observable } from 'rxjs';

@Controller('auth')
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Post('register')
  @ResponseMessage('User created successfully')
  register(@Body() registerDto: RegisterRequest) {
    return this.usersService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ResponseMessage('Login success')
  @HttpCode(200)
  login(@Request() req) {
    return this.usersService.login(req.user);
  }
}
