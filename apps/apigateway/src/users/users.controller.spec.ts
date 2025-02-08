import { Test, TestingModule } from '@nestjs/testing';
import { GeneralUsersController, UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { INestApplication } from '@nestjs/common';
import { Response } from 'express';
import { RegisterDto } from '../../src/users/dto/register';
import { LoginDto } from '../../src/users/dto/login';
import { ConfigService } from '@nestjs/config';
import { FileServiceService } from '../../src/file-service/file-service.service';
import { ChangePasswordDto } from '../../src/users/dto/change-password';
import { ProfileDto } from '../../src/users/dto/profile';

describe('UsersController', () => {
  let usersController: UsersController;
  let generalUsersController: GeneralUsersController;
  let usersService: UsersService;
  let app: INestApplication;
  let fileService: FileServiceService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController, GeneralUsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            register: jest.fn().mockResolvedValue({
              user: {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
              },
            }),
            login: jest.fn().mockResolvedValue({
              user: {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
              },
              accessToken: 'testAccessToken',
            }),
            accessToken: jest.fn().mockResolvedValue({
              accessToken: 'newTestAccessToken',
            }),
            handleLogout: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
            sendMailForForgotPassword: jest.fn().mockResolvedValue({ message: 'Email sent' }),
            validateResetToken: jest.fn().mockResolvedValue({ message: 'Token is valid' }),
            resetPassword: jest.fn().mockResolvedValue({ message: 'Password reset successfully' }),
            changePassword: jest.fn().mockResolvedValue({ message: 'Password changed successfully' }),
            updateProfile: jest.fn().mockResolvedValue({
              user: {
                id: '1',
                name: 'Updated Test User',
                phoneNumber: '1234567890',
              },
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {}, // Nếu cần, có thể mock các hàm get() ở đây
        },
        {
          provide: FileServiceService,
          useValue: {
            uploadFiles: jest.fn().mockResolvedValue([{ path: 'newAvatarUrl' }]),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    fileService = module.get<FileServiceService>(FileServiceService);
    configService = module.get<ConfigService>(ConfigService);
    generalUsersController = module.get<GeneralUsersController>(GeneralUsersController);

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
    expect(generalUsersController).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword',
      };

      const result = await usersController.register(registerDto);
      expect(result).toEqual({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      });
      expect(usersService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'testpassword',
      };

      const response: Partial<Response> = {
        cookie: jest.fn(),
      };

      const result = await usersController.login(loginDto, response as Response);
      expect(result).toEqual({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'testAccessToken',
      });
      expect(usersService.login).toHaveBeenCalledWith(loginDto, response);
    });
  });

  describe('accessToken', () => {
    it('should get a new access token', async () => {
      const request = {
        cookies: {
          refreshToken: 'testRefreshToken',
        },
      };
      const response: Partial<Response> = {
        cookie: jest.fn(),
      };

      const result = await usersController.accessToken(request as any, response as Response);
      expect(result).toEqual({
        accessToken: 'newTestAccessToken',
      });
      expect(usersService.accessToken).toHaveBeenCalledWith('testRefreshToken', response);
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const authHeader = 'Bearer testAccessToken';
      const response: Partial<Response> = {
        clearCookie: jest.fn(),
      };

      const result = await usersController.logout(authHeader, response as Response);
      expect(result).toEqual({ email: 'test@example.com' });
      expect(usersService.handleLogout).toHaveBeenCalledWith('testAccessToken', response);
    });
  });

  describe('forgotPassword', () => {
    it('should send a forgot password email', async () => {
      const email = 'test@example.com';
      const result = await usersController.forgotPassword(email);
      expect(result).toEqual({ message: 'Email sent' });
      expect(usersService.sendMailForForgotPassword).toHaveBeenCalledWith(email);
    });
  });

  describe('validateResetToken', () => {
    it('should validate a reset token', async () => {
      const token = 'testToken';
      const result = await usersController.validateResetToken(token);
      expect(result).toEqual({ message: 'Token is valid' });
      expect(usersService.validateResetToken).toHaveBeenCalledWith(token);
    });
  });

  describe('resetPassword', () => {
    it('should reset a user\'s password', async () => {
      const body = {
        token: 'testToken',
        newPassword: 'newTestPassword',
      };
      const result = await usersController.resetPassword(body);
      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(usersService.resetPassword).toHaveBeenCalledWith(body.token, body.newPassword);
    });
  });

  describe('changePassword', () => {
    it('should change a user\'s password', async () => {
      const user = { id: '1' };
      const body: ChangePasswordDto = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      };
      const result = await usersController.changePassword(user as any, body);
      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(usersService.changePassword).toHaveBeenCalledWith({
        id: user.id,
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update a user\'s profile', async () => {
      const authHeader = 'Bearer testAccessToken';
      const profileDto: ProfileDto = {
        name: 'Updated Test User',
        phoneNumber: '1234567890',
      };
      const result = await generalUsersController.updateProfile(authHeader, profileDto);
      expect(result).toEqual({
        user: {
          id: '1',
          name: 'Updated Test User',
          phoneNumber: '1234567890',
        },
      });
      expect(usersService.updateProfile).toHaveBeenCalledWith('testAccessToken', profileDto);
    });
  });
});
