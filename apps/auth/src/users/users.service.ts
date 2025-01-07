import { ChangePasswordRequest, DecodeAccessResponse, EmailRequest, ProfileRespone, UpdateAvatarRequest, UpdateProfileRequest, UserResponse } from './../../../../libs/common/src/types/auth';
import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { RegisterDto, } from '../../../apigateway/src/users/dto/register';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from 'apps/auth/src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthRequest, LogoutRequest } from '@app/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { handleRpcException } from '@app/common/filters/handleException';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('NOTIFICATION_SERVICE') private readonly rabbitNotification: ClientProxy,
    @Inject('FILE_SERVICE') private readonly rabbitFile: ClientProxy
  ) { }

  // onModuleInit() {
  //   this.client.connect();
  // }

  async findByEmailWithoutPassword(email: string) {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new RpcException({
          message: 'User not found',
          code: HttpStatus.NOT_FOUND,
        });
      }
      return { user: this.transformAccessResponse(user) }
    } catch (error) {
      throw handleRpcException(error, 'Error finding user by email');
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new RpcException({
        message: 'Database error while finding user',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findById(id: string): Promise<DecodeAccessResponse> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new RpcException({
          message: 'User not found',
          code: HttpStatus.NOT_FOUND,
        });
      }
      return this.transformAccessResponse(user);
    } catch (error) {
      throw handleRpcException(error, 'Error finding user by id');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      throw new RpcException({
        message: 'Error hashing password',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async register(registerDto: RegisterDto): Promise<any> {
    try {
      const isExistUser = await this.findByEmail(registerDto.email);
      if (isExistUser) {
        throw new RpcException({
          message: 'Email is already registered',
          code: HttpStatus.BAD_REQUEST,
        });
      }
      const hashedPassword = await this.hashPassword(registerDto.password);
      const user = await this.userModel.create({ ...registerDto, password: hashedPassword });
      const userResponse = this.transformUserDataResponse(user);
      // this.client.emit('user_registered', { email: user.email, name: user.name });
      return { user: userResponse };
    } catch (error) {
      throw handleRpcException(error, 'Error during registration');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto);
      if (!user) {
        throw new RpcException({
          message: 'Email or password is incorrect',
          code: HttpStatus.UNAUTHORIZED,
        });
      }
      return this.handleToken(user);
    } catch (error) {
      throw handleRpcException(error, 'Error during login');
    }
  }

  async handleLogout(accessToken: LogoutRequest) {
    try {
      const isValid = await this.jwtService.verify(accessToken.accessToken);
      await this.setRefreshToken(isValid.sub, "");
      return {
        email: isValid.email
      };
    } catch (error) {
      throw handleRpcException(
        new RpcException({
          message: 'Token expired',
          code: HttpStatus.BAD_REQUEST,
        })
        , 'Error during logout'
      );
    }
  }

  async updateProfile(data: UpdateProfileRequest) {
    try {
      const isValid = await this.jwtService.verify(data.accessToken);
      const user = await this.userModel.findByIdAndUpdate(isValid.sub, data, { new: true });
      const userResponse = this.transformUserDataResponse(user);
      return { user: userResponse };
    } catch (error) {
      throw handleRpcException(
        new RpcException({
          message: error.message,
          code: HttpStatus.BAD_REQUEST,
        }),
        'Error during update profile'
      );
    }
  }

  async updateAvatar(data: UpdateAvatarRequest) {
    try {
      this.rabbitFile.emit('delete_avatar', { publicId: data.previousAvatarId, entityId: data.id });
      const user = await this.userModel.findByIdAndUpdate(data.id, { avatar: data.avatar, oldAvatarId: data.oldAvatarId }, { new: true });
      const userResponse = this.transformUserDataResponse(user);
      return { user: userResponse };
    } catch (error) {
      throw handleRpcException(
        new RpcException({
          message: error.message,
          code: HttpStatus.BAD_REQUEST,
        }),
        'Error during update avatar'
      );
    }
  }

  async handleGoogleAuth(request: GoogleAuthRequest) {
    try {
      const isExistUser = await this.findByEmail(request.email);
      if (isExistUser) {
        const userResponse = this.transformUserDataResponse(isExistUser);
        return this.handleToken(userResponse);
      }
      return this.registerGoogle(request);
    } catch (error) {
      throw handleRpcException(error, 'Error during google auth');
    }
  }

  async accessToken(refreshToken: string) {
    try {
      const user = await this.userModel.findOne({ refreshToken });
      if (!user) {
        throw new RpcException({
          message: 'Invalid token',
          code: HttpStatus.BAD_REQUEST,
        });
      }
      const userResponse = this.transformUserDataResponse(user);
      return this.handleToken(userResponse);
    } catch (error) {
      throw handleRpcException(error, 'Error during access token');
    }
  }

  async registerGoogle(user: GoogleAuthRequest): Promise<any> {
    try {
      const hashedPassword = await bcrypt.hash(user.accessToken, 10);
      const newUser = await this.userModel.create({ email: user.email, name: user.name, password: hashedPassword, avatar: user.picture });
      const userResponse = this.transformUserDataResponse(newUser);
      return this.handleToken(userResponse);
    } catch (error) {
      throw handleRpcException(error, 'Error during google registration');
    }
  }

  async validateUser(loginDto: LoginDto): Promise<any> {
    try {
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
    } catch (error) {
      throw handleRpcException(error, 'Error validating user');
    }
  }

  async handleToken(user: UserResponse) {
    try {
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.createAccessToken(payload);
      const refreshToken = this.createRefreshToken(payload);

      await this.setRefreshToken(user.id, refreshToken);
      const userResponse = this.transformUserDataResponse(user);
      return {
        user: userResponse,
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw handleRpcException(error, 'Error handling token');
    }
  }

  async getAllUser(query: any) {
    try {
      const { filter, limit, sort } = aqp(query);
      const page = parseInt(filter.page || '1', 10);
      delete filter.page;

      const population = filter.population?.split(',').map(field => ({ path: field.trim() }));
      const skip = (page - 1) * (limit || 10);
      const totalItems = await this.userModel.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limit);

      const users = await this.userModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort as any)
        .populate(population)
        .exec();

      const userResponses: UserResponse[] = users.map((user) => this.transformUserDataResponse(user));
      return {
        meta: {
          page,
          limit,
          totalPages,
          totalItems,
          count: users.length,
        },
        users: userResponses,
      };
    } catch (error) {
      throw handleRpcException(error, 'Failed to get all user');
    }
  }

  async changePassword(request: ChangePasswordRequest) {
    try {
      const user = await this.userModel.findById(request.id);
      if (!user) {
        throw new RpcException({
          message: 'User not found',
          code: HttpStatus.NOT_FOUND,
        });
      }
      const isMatch = await bcrypt.compare(request.currentPassword, user.password);
      if (!isMatch) {
        throw new RpcException({
          message: 'Current password is incorrect',
          code: HttpStatus.BAD_REQUEST,
        });
      }
      const hashedPassword = await this.hashPassword(request.newPassword);
      await this.userModel.findByIdAndUpdate(request.id, { password: hashedPassword });
      return
    } catch (error) {
      throw handleRpcException(error, 'Error changing password');
    }
  }

  transformUserDataResponse(user: any): UserResponse {
    return {
      id: user._id ? user._id.toString() : user.id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber || null,
      isActive: user.isActive,
      role: user.role,
      lastLoginAt: user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : null,
    };
  }

  transformAccessResponse(user: any): DecodeAccessResponse {
    return {
      id: user._id ? user._id.toString() : user.id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      oldAvatarId: user.oldAvatarId || null,
      phoneNumber: user.phoneNumber || null,
      isActive: user.isActive,
      role: user.role,
      lastLoginAt: user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : null,
    };
  }

  async setRefreshToken(id: string, refreshToken: string) {
    try {
      return this.userModel.findByIdAndUpdate(id, { refreshToken });
    } catch (error) {
      throw new RpcException({
        message: 'Error setting refresh token',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
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

  async verifyAccessToken(accessToken: string) {
    try {
      return
    } catch (error) {
      throw new RpcException({
        message: 'Invalid token',
        code: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
