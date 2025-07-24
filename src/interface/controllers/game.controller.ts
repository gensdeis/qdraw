import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GameUseCase } from '../../application/game/game.usecase';
import { SignalType } from '../../domain/game/game.entity';

@ApiTags('Game')
@Controller('game')
export class GameController {
  constructor(private readonly gameUseCase: GameUseCase) {}

  @Post('create')
  @ApiOperation({ summary: 'Create Game' })
  async create(@Body() dto: { matchId: string; user1Id: string; user2Id: string }) {
    return this.gameUseCase.createGame(dto.matchId, dto.user1Id, dto.user2Id);
  }

  @Post(':id/signal')
  @ApiOperation({ summary: 'Send Signal' })
  async sendSignal(
    @Param('id') id: string,
    @Body() dto: { userId: string; type: SignalType; value: number },
  ) {
    return this.gameUseCase.sendSignal(id, dto.userId, dto.type, dto.value);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Game Result' })
  async get(@Param('id') id: string) {
    return this.gameUseCase.finishGame(id);
  }
} 