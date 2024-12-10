import { Controller, Get, Post, Body, HttpCode, Req, Res, Headers, UnauthorizedException, UseGuards, HttpStatus, Put, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { Response, Request as ExpressRequest } from 'express';
import { ProfileDto } from 'apps/apigateway/src/users/dto/profile';
import { GoogleAuthGuard } from 'apps/apigateway/src/guards/google-auth/google-auth.guard';
import { ResponseMessage, User } from 'apps/apigateway/src/decorators/public.decorator';
import { JwtAuthGuard } from 'apps/apigateway/src/guards/jwt-auth.guard';
import { UserResponse } from '@app/common';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  @ResponseMessage('User created successfully')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Post('login')
  @ResponseMessage('User logged in successfully')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.usersService.login(loginDto, response);
  }

  @Get('refresh')
  @ResponseMessage('Get access token success')
  async accessToken(@Req() req: ExpressRequest, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies['refreshToken'];
    return this.usersService.accessToken(refreshToken, response);
  }

  @Post('logout')
  @ResponseMessage('Logout success')
  async logout(@Headers('authorization') authHeader: string, @Res({ passthrough: true }) response: Response) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token is required or invalid');
    }
    const accessToken = authHeader.split(' ')[1];
    return this.usersService.handleLogout(accessToken, response);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Forgot password success')
  async forgotPassword(@Body('email') email: string) {
    // return this.authService.handleForgotPassword(email);
    return "asb"
  }

  @Get("google/login")
  @UseGuards(GoogleAuthGuard)
  @ResponseMessage('Login with google success')
  async googleLogin() {
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login with google success')
  async googleCallback(@Req() req, @Res({ passthrough: true }) response: Response) {
    const user = req.user;
    return this.usersService.handleGoogleAuth(user, response);
  }
}

@Controller('users')
export class GeneralUsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('User profile fetched successfully')
  async getProfile(@User() user: UserResponse) {
    return {user};
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('User profile updated successfully')
  async updateProfile(@Headers('authorization') authHeader: string, @Body() profileDto: ProfileDto) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token is required or invalid');
    }
    const accessToken = authHeader.split(' ')[1];
    return this.usersService.updateProfile(accessToken, profileDto);
  }
}
