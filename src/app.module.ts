import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './interface/controllers/user.module';
import { UserOrmEntity } from './infrastructure/db/user.orm-entity';
import { MatchModule } from './interface/controllers/match.module';
import { GameModule } from './interface/controllers/game.module';
import { GameGatewayModule } from './interface/gateways/game.gateway.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [UserOrmEntity],
      synchronize: true,
    }),
    JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '1d' } }),
    UserModule,
    MatchModule,
    GameModule,
    GameGatewayModule,
  ],
})
export class AppModule {}
