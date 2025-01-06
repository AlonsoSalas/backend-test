import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    generateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('generateToken', () => {
    it('should return a token when username is provided', () => {
      const username = 'backendTest';
      const mockToken = 'mocked_token';
      mockAuthService.generateToken.mockReturnValue(mockToken);

      const result = authController.generateToken({ username });

      expect(mockAuthService.generateToken).toHaveBeenCalledWith(username);
      expect(result).toEqual({ token: mockToken });
    });

    it('should throw BadRequestException when username is missing', () => {
      try {
        authController.generateToken({ username: undefined });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toBe(
          'Username cannot be empty or undefined',
        );
      }
    });

    it('should throw BadRequestException when username is empty', () => {
      try {
        authController.generateToken({ username: '' });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toBe(
          'Username cannot be empty or undefined',
        );
      }
    });
  });
});
