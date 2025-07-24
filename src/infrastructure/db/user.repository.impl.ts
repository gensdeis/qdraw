import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/user/user.repository';
import { User, UserStatus } from '../../domain/user/user.entity';
import { UserOrmEntity } from './user.orm-entity';

function toDomain(entity: UserOrmEntity): User {
  return new User(
    entity.id,
    entity.username,
    entity.password,
    entity.winCount,
    entity.loseCount,
    entity.reward,
    entity.status,
    entity.lastHeartbeat,
    entity.winStreak,
    entity.maxWinStreak,
  );
}

function toOrm(user: User): UserOrmEntity {
  const entity = new UserOrmEntity();
  entity.id = user.id;
  entity.username = user.username;
  entity.password = user.password;
  entity.winCount = user.winCount;
  entity.loseCount = user.loseCount;
  entity.reward = user.reward;
  entity.status = user.status;
  entity.lastHeartbeat = user.lastHeartbeat;
  entity.winStreak = user.winStreak;
  entity.maxWinStreak = user.maxWinStreak;
  return entity;
}

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repo.findOneBy({ username });
    return entity ? toDomain(entity) : null;
  }

  async create(user: User): Promise<User> {
    const entity = toOrm(user);
    await this.repo.insert(entity);
    return user;
  }

  async update(user: User): Promise<User> {
    await this.repo.update(user.id, toOrm(user));
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async list(): Promise<User[]> {
    const entities = await this.repo.find();
    return entities.map(toDomain);
  }
} 