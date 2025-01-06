import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as any;
    jwtAuthGuard = new JwtAuthGuard(jwtService);
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
  });

  describe('canActivate', () => {
    let context: ExecutionContext;
    let request: Request;

    beforeEach(() => {
      request = { headers: {} } as any;
      context = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue(request),
      } as any;
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('No token provided'),
      );
    });

    it('should throw UnauthorizedException if token is invalid or expired', async () => {
      request.headers.authorization = 'Bearer invalid-token';

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('Invalid token'));

      await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Invalid or expired token'),
      );
    });

    it('should return true if token is valid', async () => {
      const validToken = 'valid-token';
      const mockPayload = { username: 'testUser' };
      request.headers.authorization = `Bearer ${validToken}`;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(mockPayload);

      const result = await jwtAuthGuard.canActivate(context);

      expect(result).toBe(true);
      expect(request['user']).toEqual(mockPayload);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should return null if no authorization header is provided', () => {
      const token = jwtAuthGuard['extractTokenFromHeader']({} as Request);
      expect(token).toBeNull();
    });

    it('should return null if authorization header does not start with Bearer', () => {
      const token = jwtAuthGuard['extractTokenFromHeader']({
        headers: { authorization: 'Bearer' },
      } as Request);
      expect(token).toBeNull();
    });

    it('should extract token from Bearer authorization header', () => {
      const token = jwtAuthGuard['extractTokenFromHeader']({
        headers: { authorization: 'Bearer valid-token' },
      } as Request);
      expect(token).toBe('valid-token');
    });
  });
});
