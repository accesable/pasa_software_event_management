import { Controller, Get, Post, Body, HttpCode, Req, Res, Headers, UnauthorizedException, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseMessage } from 'apps/auth/src/decorators/public.decorator';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { Response, Request as ExpressRequest } from 'express';

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
  @HttpCode(200)
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.usersService.login(loginDto, response);  // Đảm bảo không cần toPromise()
  }


  @Get('access-token')
  @ResponseMessage('Get access token success')
  async accessToken(@Req() req: ExpressRequest, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token does not exist. Please login again');
    }
    return this.usersService.accessToken(refreshToken, response);
  }

  @Post('logout')
  @ResponseMessage('Logout success')
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token is required or invalid');
    }
    const accessToken = authHeader.split(' ')[1];
    return this.usersService.handleLogout(accessToken);
  }

  @Post('forgot-password')
  @ResponseMessage('Forgot password success')
  async forgotPassword(@Body('email') email: string) {
    // return this.authService.handleForgotPassword(email);
    return "asb"
  }

  @Get("google/login")
  @ResponseMessage('Login with google success')
  async googleLogin() {
    // return this.authService.googleLogin();
  }

  @Get("google/callback")
  @ResponseMessage('Login with google success')
  async googleCallback(@Req() req, @Res({ passthrough: true }) response: Response) {
    const user = req.user; // Thông tin người dùng từ Google    
    console.log(user);
    // return this.usersService.handleGoogleAuth(user, response);
  }
}
