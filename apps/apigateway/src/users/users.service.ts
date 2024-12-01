import { AUTH_SERVICE } from './constants';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { USERS_SERVICE_NAME, UsersServiceClient } from '@app/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { Request, Response } from 'express';

@Injectable()
export class UsersService implements OnModuleInit {
  private usersService: UsersServiceClient;
  constructor(
    @Inject(AUTH_SERVICE) private client: ClientGrpc
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
      response.cookie('refreshToken', data.refreshToken, {
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
      });

      return {
        user: data.user,
        accessToken: data.accessToken
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }


  accessToken(refreshToken: string, response: Response) {
    const request = { refreshToken };
    try {
      const data = this.usersService.accessToken(request).toPromise();
      console.log(data);
      return data;
      // response.cookie('refreshToken', data.refreshToken, {
      //   maxAge: ms('15m'),
      //   httpOnly: true,
      // });
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async handleLogout(accessToken: string) {
    const request = { accessToken };
    try {
      return await this.usersService.handleLogout(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
