import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('generateToken', () => {
    it('should call jwtService.sign with correct payload and secret', () => {
      const username = 'testUser';
      const mockToken = 'mocked_token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const token = authService.generateToken(username);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { username },
        { secret: process.env.JWT_SECRET },
      );
      expect(token).toBe(mockToken);
    });

    it('should return a token', () => {
      const username = 'testUser';
      const mockToken = 'mocked_token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const token = authService.generateToken(username);

      expect(token).toBe(mockToken);
    });
  });
});
