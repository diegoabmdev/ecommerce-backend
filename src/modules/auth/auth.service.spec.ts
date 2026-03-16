import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';
import { ResetPasswordDto } from '../users/dto/reset-password.dto';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'uuid-123',
    email: 'test@example.com',
    password: bcrypt.hashSync('securePassword123', 10),
  } as unknown as User;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'securePassword123',
    };

    it('should return a user and a token on successful login', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('token');
      expect(result.user.email).toEqual(loginDto.email);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const wrongLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      await expect(service.login(wrongLoginDto)).rejects.toThrow(
        'Credenciales no válidas',
      );
    });
  });

  describe('forgotPassword', () => {
    it('should call usersService.forgotPassword and return its response', async () => {
      const dto: ForgotPasswordDto = { email: 'test@example.com' };
      const expectedResponse = { message: 'Correo de recuperación enviado.' };

      mockUsersService.forgotPassword.mockResolvedValue(expectedResponse);

      const result = await service.forgotPassword(dto);

      expect(mockUsersService.forgotPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('resetPassword', () => {
    it('should call usersService.resetPassword and return its response', async () => {
      const dto: ResetPasswordDto = {
        token: 'valid-token',
        newPassword: 'newPassword123',
      };
      const expectedResponse = {
        message: 'Tu contraseña ha sido actualizada exitosamente',
      };

      mockUsersService.resetPassword.mockResolvedValue(expectedResponse);

      const result = await service.resetPassword(dto);

      expect(mockUsersService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });
});
