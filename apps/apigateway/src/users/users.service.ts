import { AUTH_SERVICE } from './constants';
import * as ms from 'ms';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleAuthRequest, UpdateAvatarRequest, UpdateProfileRequest, UserResponse, USERS_SERVICE_NAME, UsersServiceClient } from '@app/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProfileDto } from 'apps/apigateway/src/users/dto/profile';

@Injectable()
export class UsersService implements OnModuleInit {
  private usersService: UsersServiceClient;
  constructor(
    @Inject(AUTH_SERVICE) private client: ClientGrpc,
    private configService: ConfigService,
  ) { }

  onModuleInit() {
    this.usersService = this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
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

  async updateAvatar(request: UpdateAvatarRequest){
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
