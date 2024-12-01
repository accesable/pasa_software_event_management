import { Injectable, BadRequestException } from '@nestjs/common';
import { RegisterDto, } from '../../../apigateway/src/users/dto/register';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from 'apps/auth/src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserResponse } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const isExistUser = await this.findByEmail(registerDto.email);
    if (isExistUser) {
      throw new RpcException('Email is already registered');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userModel.create({ ...registerDto, password: hashedPassword });
    user.password = undefined;
    const userResponse = this.transformUserDataResponse(user);
    // const message = await this.sendMail(newUser.name, newUser.username);
    return { user: userResponse };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new RpcException('Invalid email or password');
    }
    return this.handleToken(user);
  }

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.findByEmail(loginDto.email);
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      return null;
    }
    const userUpdated = await this.userModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }, { new: true });
    return userUpdated;
  }

  async handleToken(user: UserResponse) {
    const payload = { username: user.email, sub: user.id };
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.setRefreshToken(user.id, refreshToken);
    const userResponse = this.transformUserDataResponse(user);
    return {
      user: userResponse,
      accessToken,
      refreshToken
    };
  }

  transformUserDataResponse(user: any): UserResponse {
    const userResponse: UserResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      role: user.role,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
    return userResponse;
  }

  async setRefreshToken(id: string, refreshToken: string) {
    return this.userModel.findByIdAndUpdate(id, { refreshToken });
  }

  createAccessToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: this.configService.get<string>("JWT_EXPIRATION"),
    });
  }

  createRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRATION"),
    });
  }
}
