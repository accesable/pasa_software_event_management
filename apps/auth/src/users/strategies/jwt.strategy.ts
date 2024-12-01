import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'apps/auth/src/users/users.service';
import { UserResponse } from '@app/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findByEmail(payload.username);
    if (!user) {
      return null;
    }
    
    const userResponse: UserResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      role: user.role,
      lastLoginAt: user.lastLoginAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
    return userResponse;
  }
}
