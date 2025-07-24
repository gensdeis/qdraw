import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { MatchModule } from '../controllers/match.module';
import { GameModule } from '../controllers/game.module';
import { UserModule } from '../controllers/user.module';

@Module({
  imports: [MatchModule, GameModule, UserModule],
  providers: [GameGateway],
})
export class GameGatewayModule {} 