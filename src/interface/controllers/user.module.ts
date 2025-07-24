import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserUseCase } from '../../application/user/user.usecase';
import { UserRepositoryImpl } from '../../infrastructure/db/user.repository.impl';
import { UserOrmEntity } from '../../infrastructure/db/user.orm-entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '1d' } }),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryImpl,
    },
    {
      provide: UserUseCase,
      useFactory: (repo, jwtService: JwtService) => new UserUseCase(repo, jwtService),
      inject: ['IUserRepository', JwtService],
    },
    JwtAuthGuard,
  ],
  exports: [UserUseCase],
})
export class UserModule {} 