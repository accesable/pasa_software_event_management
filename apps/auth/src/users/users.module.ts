import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GoogleStrategy } from 'apps/auth/src/users/strategies/google.stategy';
import { JwtStrategy } from 'apps/auth/src/users/strategies/jwt.strategy';
import { LocalStrategy } from 'apps/auth/src/users/strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'apps/auth/src/users/schemas/user.schema';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),  // Lấy biến từ .env
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },  // Lấy thời gian hết hạn từ .env
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, LocalStrategy, JwtStrategy, GoogleStrategy],
})
export class UsersModule {}
