import { AUTH_SERVICE } from '../constants/service.constant';
import * as ms from 'ms';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ChangePasswordRequest, GoogleAuthRequest, UpdateAvatarRequest, UpdateProfileRequest, UpgradeUserRequest, UserResponse, USERS_SERVICE_NAME, UsersServiceClient } from '@app/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProfileDto } from 'apps/apigateway/src/users/dto/profile';
import { QueryParamsRequest } from '@app/common/types/event';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { NotificationService } from 'apps/apigateway/src/notification/notification.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private usersService: UsersServiceClient;
  private readonly redisClient: Redis;

  constructor(
    @Inject(AUTH_SERVICE) private client: ClientGrpc,
    private configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,
  ) {
    this.redisClient = this.redisService.getClient();
  }

  onModuleInit() {
    this.usersService = this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  async setCacheData(key: string, value: any, ttl?: number) {
    await this.redisClient.set(key, value, 'EX', ttl || this.configService.get<number>('CACHE_TTL'));
  }

  async getCacheData(key: string) {
    return await this.redisClient.get(key);
  }

  async validateResetToken(token: string) {
    const key = `reset_password:${token}`;
    const cacheData = await this.getCacheData(key);
    if (!cacheData) {
      throw new RpcException(
        {
          code: 410,
          error: 'The reset password link has expired',
        }
      );
    }
    await this.redisClient.del(key);
    return JSON.parse(cacheData);
  }

  async getAllUser(request: QueryParamsRequest) {
    try {
      const key = `getAllUser:${JSON.stringify(request)}`;
      const cacheData = await this.getCacheData(key);
      if (cacheData) {
        return JSON.parse(cacheData);
      }
      const data = await this.usersService.getAllUser(request).toPromise();
      await this.setCacheData(key, JSON.stringify(data), 60*5);
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
        await this.setCacheData(key, JSON.stringify(tokenData), 900);
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

  async upgradeUser(request: UpgradeUserRequest) {
    try {
      return await this.usersService.upgradeUser(request).toPromise();
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
