import { AUTH_SERVICE } from './constants';
import * as ms from 'ms';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleAuthRequest, USERS_SERVICE_NAME, UsersServiceClient } from '@app/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

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

      return {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async accessToken(refreshToken: string, response: Response) {
    const request = { refreshToken };
    try {
      const data = await this.usersService.accessToken(request).toPromise();
      this.setRefreshTokenCookie(response, data.refreshToken);
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

      return data;
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
}
