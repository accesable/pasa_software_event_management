import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { RegisterDto, } from './dto/register';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from 'apps/auth/src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { LoginDto } from 'apps/auth/src/users/dto/login';
import { IUser } from 'apps/auth/src/users/user.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserResponse } from '@app/common';

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
      throw new BadRequestException('Email is already registered');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userModel.create({ ...registerDto, password: hashedPassword });
    user.password = undefined;
    // const message = await this.sendMail(newUser.name, newUser.username);
    return { user };
  }

  async login(user: UserResponse) {
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
    return user;
  }

  async handleToken(user: UserResponse) {
    const payload = { username: user.email, sub: user.id };
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.setRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken
    };
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
