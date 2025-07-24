import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameUseCase } from '../../application/game/game.usecase';
import { GameRepositoryMemory } from '../../infrastructure/game/game.repository.memory';

@Module({
  controllers: [GameController],
  providers: [
    {
      provide: 'IGameRepository',
      useClass: GameRepositoryMemory,
    },
    {
      provide: GameUseCase,
      useFactory: (repo) => new GameUseCase(repo),
      inject: ['IGameRepository'],
    },
  ],
  exports: [GameUseCase],
})
export class GameModule {} 