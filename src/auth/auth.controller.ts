import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('generate-token')
  generateToken(@Body('username') username: string): { token: string } {
    const token = this.authService.generateToken(username);
    return { token };
  }
}
