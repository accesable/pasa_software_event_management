import { Controller, Get, Post, Body, HttpCode, Req, Res, Headers, UnauthorizedException, UseGuards, HttpStatus, Put, Patch, UseInterceptors, BadRequestException, UploadedFile, Param, Query, } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { Response, Request as ExpressRequest } from 'express';
import { ProfileDto } from 'apps/apigateway/src/users/dto/profile';
import { GoogleAuthGuard } from 'apps/apigateway/src/guards/google-auth/google-auth.guard';
import { ResponseMessage, Roles, User } from 'apps/apigateway/src/decorators/public.decorator';
import { JwtAuthGuard } from 'apps/apigateway/src/guards/jwt-auth.guard';
import { DecodeAccessResponse, UpdateAvatarRequest, UserResponse } from '@app/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'apps/apigateway/src/files/files.service';
import { RolesGuard } from 'apps/apigateway/src/guards/roles.guard';
import { ChangePasswordDto } from 'apps/apigateway/src/users/dto/change-password';
import { UpgradeDto } from 'apps/apigateway/src/users/dto/upgrade';

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
    return this.usersService.forgotPassword(email);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Password changed successfully')
  async changePassword(@User() user: UserResponse, @Body() body: ChangePasswordDto) {
    const { currentPassword, newPassword } = body;
    return this.usersService.changePassword({ id: user.id, currentPassword, newPassword });
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
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer', 'admin')
  @ResponseMessage('Users fetched successfully')
  async getAllUser(@Query() query: any) {
    return this.usersService.getAllUser({ query });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('User profile fetched successfully')
  async getProfile(@User() user: UserResponse) {
    return { user };
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

  @Patch('upgrade/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ResponseMessage('User upgraded successfully')
  async upgradeUser(@Param('id') id: string, @Body() body: UpgradeDto) {
    return this.usersService.upgradeUser({ id, role: body.role });
  }

  @Post('upload/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // giới hạn 5MB
    },
    fileFilter: (req, file, callback) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype)) {
        return callback(new BadRequestException('Only [jpeg, png, jpg] types are allowed'), false);
      }
      callback(null, true);
    }
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @User() user: DecodeAccessResponse) {
    const data = await this.filesService.uploadFile(file, user);
    const request: UpdateAvatarRequest = {
      avatar: data.secure_url,
      oldAvatarId: data.public_id,
      id: user.id,
    }
    return this.usersService.updateAvatar(request)
  }
}
