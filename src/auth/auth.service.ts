import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(username: string): string {
    const payload = { username };
    return this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
  }
}
