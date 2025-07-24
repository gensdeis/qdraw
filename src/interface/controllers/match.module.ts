import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MatchController } from './match.controller';
import { MatchUseCase } from '../../application/match/match.usecase';
import { MatchRepositoryMemory } from '../../infrastructure/match/match.repository.memory';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '1d' } }),
  ],
  controllers: [MatchController],
  providers: [
    {
      provide: 'IMatchRepository',
      useClass: MatchRepositoryMemory,
    },
    {
      provide: MatchUseCase,
      useFactory: (repo) => new MatchUseCase(repo),
      inject: ['IMatchRepository'],
    },
    JwtAuthGuard,
  ],
  exports: [MatchUseCase],
})
export class MatchModule {} 