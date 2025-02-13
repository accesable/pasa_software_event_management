import { AUTH_SERVICE } from '../constants/service.constant';
import * as ms from 'ms';
import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProfileDto } from './dto/profile';
import { NotificationService } from '../notification/notification.service';
import { RedisCacheService } from '../redis/redis.service';
import { FileServiceService } from '../file-service/file-service.service';
import { AllUserResponse, ChangePasswordRequest, GoogleAuthRequest, QueryParamsRequest, UpdateAvatarRequest, UpdateProfileRequest, USERS_SERVICE_NAME, UsersServiceClient } from '../../../../libs/common/src';
import { EventServiceService } from '../event-service/event-service.service';
import { DashboardStatsDto } from '../event-service/dto/dashboard-stats.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private usersService: UsersServiceClient;

  constructor(
    @Inject(AUTH_SERVICE) private client: ClientGrpc,
    private configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly redisCacheService: RedisCacheService,
    private readonly fileServiceService: FileServiceService,
  ) { }

  onModuleInit() {
    this.usersService = this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  async validateResetToken(token: string) {
    const key = `reset_password:${token}`;
    const cacheData = await this.redisCacheService.get<string>(key);
    if (!cacheData) {
      throw new RpcException(
        {
          code: 410,
          error: 'The reset password link has expired',
        }
      );
    }
    await this.redisCacheService.del(key);
    await this.redisCacheService.set(key, cacheData, 900);
    return { message: 'Token is valid' };
  }

  async resetPassword(token: string, password: string) {
    try {
      const key = `reset_password:${token}`;
      const cacheData = await this.redisCacheService.get<{
        id: string;
        name: string;
        email: string;
        type: string;
      }>(key);

      if (!cacheData) {
        throw new RpcException({
          code: 410,
          error: 'The reset password link has expired',
        });
      }
      const request = {
        id: cacheData.id,
        password,
      };
      await this.usersService.resetPassword(request).toPromise();
      await this.redisCacheService.del(key);

      return { message: 'Reset password success' };
    } catch (error) {
      throw new BadRequestException('Token was expired or used');
    }
  }

  async getAllUser(request: QueryParamsRequest) {
    try {
      const key = `getAllUser:${JSON.stringify(request)}`;
      const cacheData = await this.redisCacheService.get<AllUserResponse>(key);
      if (cacheData) {
        return cacheData;
      }
      const data = await this.usersService.getAllUser(request).toPromise();
      await this.redisCacheService.set(key, data, 60 * 5);
      return data;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      return await this.usersService.register(registerDto).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async login(loginDto: LoginDto, response: Response) {
    try {
      const data = await this.usersService.login(loginDto).toPromise();
      this.setRefreshTokenCookie(response, data.refreshToken);

      data.refreshToken = undefined;
      return data;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async sendMailForForgotPassword(email: string) {
    try {
      const user = await this.usersService.findByEmailWithoutPassword({ email }).toPromise();
      const { id, name } = user.user;
      const data = await this.notificationService.sendMailForForgotPassword(email, id, name);
      if (data.status === 'success') {
        const key = `reset_password:${data.token}`;
        const { tokenData } = data;
        await this.redisCacheService.set(key, JSON.stringify(tokenData), 900);
        return data;
      }
      return data;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async changePassword(request: ChangePasswordRequest) {
    try {
      return await this.usersService.changePassword(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async accessToken(refreshToken: string, response: Response) {
    try {
      const request = { refreshToken };
      const data = await this.usersService.accessToken(request).toPromise();
      this.setRefreshTokenCookie(response, data.refreshToken);

      data.refreshToken = undefined;
      return data;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async handleLogout(accessToken: string, response: Response) {
    const request = { accessToken };
    try {
      response.clearCookie('refreshToken');
      return await this.usersService.handleLogout(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async handleGoogleAuth(user: GoogleAuthRequest, response: Response) {
    try {
      const data = await this.usersService.handleGoogleAuth(user).toPromise();
      this.setRefreshTokenCookie(response, data.refreshToken);

      data.refreshToken = undefined;
      return data;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getUserById(id: string) {
    try {
      return await this.usersService.findById({ id }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async updateProfile(accessToken: string, profileDto: ProfileDto) {
    try {
      const transformData: UpdateProfileRequest = {
        accessToken,
        name: profileDto.name,
        phoneNumber: profileDto.phoneNumber,
        password: profileDto.password,
      };
      return await this.usersService.updateProfile(transformData).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async updateAvatar(request: UpdateAvatarRequest) {
    try {
      return await this.usersService.updateAvatar(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  setRefreshTokenCookie(response: Response, refreshToken: string) {
    try {
      response.clearCookie('refreshToken');
      response.cookie('refreshToken', refreshToken, {
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRATION')),
        httpOnly: true,
      });
    } catch (error) {
      throw new RpcException(error);
    }
  }

  findUserById(id: string) {
    try {
      return this.usersService.findById({ id }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
