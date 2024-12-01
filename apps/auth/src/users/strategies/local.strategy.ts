import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'apps/auth/src/users/users.service';
import { LoginDto } from 'apps/auth/src/users/dto/login';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super();
  }

  async validate(email: string, password: string): Promise<any> {
    const userData: LoginDto = { email, password };
    const user = await this.usersService.validateUser(userData);
    if (!user) {
      throw new UnauthorizedException("username or password is incorrect");
    }
    return user;
  }
}