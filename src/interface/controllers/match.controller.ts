import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchUseCase } from '../../application/match/match.usecase';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchUseCase: MatchUseCase) {}

  @Post('request')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request Match' })
  @UseGuards(JwtAuthGuard)
  async request(@Req() req: Request) {
    const userId = (req as any).user.sub; // JWT payload에서 sub 필드가 사용자 ID
    const match = await this.matchUseCase.requestMatch(userId);
    return match;
  }

  @Post('cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel Match' })
  @UseGuards(JwtAuthGuard)
  async cancel(@Req() req: Request) {
    const userId = (req as any).user.sub; // JWT payload에서 sub 필드가 사용자 ID
    await this.matchUseCase.cancelMatch(userId);
    return { success: true };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Match Info' })
  async get(@Param('id') id: string) {
    return this.matchUseCase.getMatch(id);
  }
} 