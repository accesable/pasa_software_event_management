import { Test, TestingModule } from '@nestjs/testing';
import { GeneralUsersController, UsersController } from './users.controller';
import { UsersService } from './users.service';
import { INestApplication } from '@nestjs/common';
import { Response } from 'express';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';
import { ConfigService } from '@nestjs/config';
import { FileServiceService } from '../file-service/file-service.service';
import { ChangePasswordDto } from './dto/change-password';
import { ProfileDto } from './dto/profile';

describe('UsersController', () => {
    let controller: UsersController;
    let controllerUser: GeneralUsersController;
    let service: UsersService;
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
                    useValue: {
                    },
                },
                {
                    provide: FileServiceService,
                    useValue: {
                        uploadFiles: jest.fn().mockResolvedValue([{ path: 'newAvatarUrl' }]),
                    },
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
        fileService = module.get<FileServiceService>(FileServiceService);
        configService = module.get<ConfigService>(ConfigService);
        controllerUser = module.get<GeneralUsersController>(GeneralUsersController);

        app = module.createNestApplication();
        await app.init();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a user', async () => {
            const registerDto: RegisterDto = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword',
            };

            const result = await controller.register(registerDto);

            expect(result).toEqual({
                user: {
                    id: '1',
                    name: 'Test User',
                    email: 'test@example.com',
                },
            });

            expect(service.register).toHaveBeenCalledWith(registerDto);
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

            const result = await controller.login(loginDto, response as Response);

            expect(result).toEqual({
                user: {
                    id: '1',
                    name: 'Test User',
                    email: 'test@example.com',
                },
                accessToken: 'testAccessToken',
            });

            expect(service.login).toHaveBeenCalledWith(loginDto, response);
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

            const result = await controller.accessToken(request as any, response as Response);

            expect(result).toEqual({
                accessToken: 'newTestAccessToken',
            });

            expect(service.accessToken).toHaveBeenCalledWith('testRefreshToken', response);
        });
    });

    describe('logout', () => {
        it('should logout a user', async () => {
            const authHeader = 'Bearer testAccessToken';
            const response: Partial<Response> = {
                clearCookie: jest.fn(),
            };

            const result = await controller.logout(authHeader, response as Response);

            expect(result).toEqual({ email: 'test@example.com' });
            expect(service.handleLogout).toHaveBeenCalledWith('testAccessToken', response);
        });
    });

    describe('forgotPassword', () => {
        it('should send a forgot password email', async () => {
            const email = 'test@example.com';

            const result = await controller.forgotPassword(email);

            expect(result).toEqual({ message: 'Email sent' });
            expect(service.sendMailForForgotPassword).toHaveBeenCalledWith(email);
        });
    });

    describe('validateResetToken', () => {
        it('should validate a reset token', async () => {
            const token = 'testToken';

            const result = await controller.validateResetToken(token);

            expect(result).toEqual({ message: 'Token is valid' });
            expect(service.validateResetToken).toHaveBeenCalledWith(token);
        });
    });

    describe('resetPassword', () => {
        it('should reset a user\'s password', async () => {
            const body = {
                token: 'testToken',
                newPassword: 'newTestPassword',
            };

            const result = await controller.resetPassword(body);

            expect(result).toEqual({ message: 'Password reset successfully' });
            expect(service.resetPassword).toHaveBeenCalledWith(body.token, body.newPassword);
        });
    });

    describe('changePassword', () => {
        it('should change a user\'s password', async () => {
            const user = { id: '1' };
            const body: ChangePasswordDto = {
                currentPassword: 'currentPassword',
                newPassword: 'newPassword',
            };

            const result = await controller.changePassword(user as any, body);

            expect(result).toEqual({ message: 'Password changed successfully' });
            expect(service.changePassword).toHaveBeenCalledWith({
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

            const result = await controllerUser.updateProfile(authHeader, profileDto);

            expect(result).toEqual({
                user: {
                    id: '1',
                    name: 'Updated Test User',
                    phoneNumber: '1234567890',
                },
            });

            expect(service.updateProfile).toHaveBeenCalledWith('testAccessToken', profileDto);
        });
    });
});