import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('generate-token')
  @ApiOperation({
    summary: 'Generate a JWT token for a user',
    description:
      'This endpoint generates a JWT token when a valid username is provided.',
  })
  @ApiBody({
    description: 'Username of the user for token generation',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
      },
      example: {
        username: 'backendTest',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated JWT token',
    schema: {
      example: {
        token: 'your-jwt-token',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request if username is missing or invalid',
  })
  generateToken(@Body() body: { username: string }): { token: string } {
    const { username } = body;

    if (!username) {
      throw new BadRequestException('Username cannot be empty or undefined');
    }

    const token = this.authService.generateToken(username);
    return { token };
  }
}
