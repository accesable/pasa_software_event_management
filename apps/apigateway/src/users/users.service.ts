import { AUTH_SERVICE } from './constants';
import { BadRequestException, Inject, Injectable, OnModuleInit, ValidationPipe } from '@nestjs/common';
import { LoginRequest, RegisterRequest, USERS_SERVICE_NAME, UsersServiceClient } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';

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
      const register = await this.usersService.register(registerDto).toPromise();
      return register;
    } catch (error) {
      if (error.code === status.INVALID_ARGUMENT) {
        throw new BadRequestException(error.details || 'Invalid arguments provided');
      } else if (error.details) {
        throw new BadRequestException(error.details);
      } else {
        // throw new BadRequestException(error);
        console.log('error', error);
        throw new BadRequestException('Invalid arguments provided');
      }
    }
  }

  login(loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
function plainToClass(RegisterRequest: any, registerDto: RegisterDto) {
  throw new Error('Function not implemented.');
}

