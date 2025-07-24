import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UserUseCase } from '../../application/user/user.usecase';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DevAuthGuard } from '../guards/dev-auth.guard';
import { Request } from 'express';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'User Registration',
    description: 'Register a new user with username and password'
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '53c9c8d3-02c6-4284-8771-a01fd90f0433' },
        username: { type: 'string', example: 'testuser' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Username already exists' })
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.userUseCase.register(dto.username, dto.password);
    return { id: user.id, username: user.username };
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'User Login',
    description: 'Login with username and password to get JWT token'
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '53c9c8d3-02c6-4284-8771-a01fd90f0433' },
            username: { type: 'string', example: 'testuser' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async login(@Body() dto: LoginUserDto) {
    const result = await this.userUseCase.login(dto.username, dto.password);
    return {
      token: result.token,
      user: {
        id: result.user.id,
        username: result.user.username,
        winCount: result.user.winCount,
        loseCount: result.user.loseCount,
        reward: result.user.reward,
        winStreak: result.user.winStreak,
      }
    };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get My Profile',
    description: 'Get current user profile information (requires authentication)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '53c9c8d3-02c6-4284-8771-a01fd90f0433' },
        username: { type: 'string', example: 'testuser' },
        winCount: { type: 'number', example: 0 },
        loseCount: { type: 'number', example: 0 },
        reward: { type: 'number', example: 0 },
        status: { type: 'string', example: 'IDLE' },
        lastHeartbeat: { type: 'string', example: '2025-07-24T01:42:28.461Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No token provided or Invalid token' })
  @UseGuards(process.env.NODE_ENV === 'development' ? DevAuthGuard : JwtAuthGuard)
  async me(@Req() req: Request) {
    const userId = (req as any).user.sub; // JWT payload에서 sub 필드가 사용자 ID
    const user = await this.userUseCase.getProfile(userId);
    return user;
  }

  @Patch('status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update Status',
    description: 'Update user status (requires authentication)'
  })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Status updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '53c9c8d3-02c6-4284-8771-a01fd90f0433' },
        username: { type: 'string', example: 'testuser' },
        status: { type: 'string', example: 'READY' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No token provided or Invalid token' })
  @UseGuards(process.env.NODE_ENV === 'development' ? DevAuthGuard : JwtAuthGuard)
  async updateStatus(@Req() req: Request, @Body() dto: UpdateStatusDto) {
    const userId = (req as any).user.sub; // JWT payload에서 sub 필드가 사용자 ID
    const user = await this.userUseCase.updateStatus(userId, dto.status);
    return user;
  }

  @Get('rank/reward')
  async getRewardRanking() {
    return this.userUseCase.getRewardRanking();
  }

  @Get('rank/winstreak')
  async getWinStreakRanking() {
    return this.userUseCase.getWinStreakRanking();
  }
} 