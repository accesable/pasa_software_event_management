import { Controller, Get, Post, Body, HttpCode, Req, Res, Headers, UnauthorizedException, UseGuards, HttpStatus, Put, Patch, UseInterceptors, BadRequestException, UploadedFile, Param, Query, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';
import { Response, Request as ExpressRequest } from 'express';
import { ProfileDto } from './dto/profile';
import { GoogleAuthGuard } from '../guards/google-auth/google-auth.guard';
import { ResponseMessage, User } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangePasswordDto } from '../users/dto/change-password';
import { FileServiceService } from '../file-service/file-service.service';
import { DecodeAccessResponse, UpdateAvatarRequest, UserResponse } from '../../../../libs/common/src';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) { }

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

  @Post('refresh')
  @ResponseMessage('Get access token success')
  async accessToken(@Req() req: ExpressRequest, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies['refreshToken'];
    console.log('refreshToken', refreshToken);
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
    return this.usersService.sendMailForForgotPassword(email);
  }

  @Get('validate-reset-token')
  @ResponseMessage('Validate reset token success')
  async validateResetToken(@Query('token') token: string) {
    return this.usersService.validateResetToken(token);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Reset password success')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.usersService.resetPassword(body.token, body.newPassword);
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
  async googleCallback(@Req() req, @Res() response: Response) {
    const user = req.user;
    const tokenData = this.usersService.handleGoogleAuth(user, response);
    const frontendUrl = `${this.configService.get<string>('FE_BASE_URL')}/dashboards/general?accessToken=${(await tokenData).accessToken}`;
    return response.redirect(frontendUrl);
  }
}

@Controller('users')
export class GeneralUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FileServiceService,
  ) { }

  @Post('upload/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Avatar updated successfully')
  async uploadAvatar(
    @User() user: DecodeAccessResponse,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB limit
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      const uploadedAvatar = await this.filesService.uploadFiles(
        [file],
        {
          entityId: user.id,
          entityType: 'user',
          type: 'image',
          field: 'avatar',
        },
      );

      if (uploadedAvatar.length === 0) {
        throw new BadRequestException('File upload failed');
      }

      const { path: avatarUrl, publicId } = uploadedAvatar[0];

      const updateAvatarRequest: UpdateAvatarRequest = {
        id: user.id,
        avatar: avatarUrl,
        oldAvatarId: publicId,
        previousAvatarId: user.oldAvatarId,
      };

      return this.usersService.updateAvatar(updateAvatarRequest);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
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
}
