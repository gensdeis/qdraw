import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepositoryImpl } from './user.repository.impl';
import { UserOrmEntity } from './user.orm-entity';
import { User, UserStatus } from '../../domain/user/user.entity';
import { v4 as uuidv4 } from 'uuid';

describe('UserRepositoryImpl', () => {
  let repo: UserRepositoryImpl;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [UserOrmEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([UserOrmEntity]),
      ],
      providers: [UserRepositoryImpl],
    }).compile();
    repo = moduleRef.get(UserRepositoryImpl);
  });

  it('create/findById/findByUsername', async () => {
    const user = new User(uuidv4(), 'testuser', 'pw', 1, 2, 100, UserStatus.IDLE, new Date());
    await repo.create(user);
    const found = await repo.findById(user.id);
    expect(found).toMatchObject({ username: 'testuser', winCount: 1 });
    const foundByName = await repo.findByUsername('testuser');
    expect(foundByName?.id).toBe(user.id);
  });

  it('update', async () => {
    const user = await repo.findByUsername('testuser');
    if (!user) throw new Error('user not found');
    user.winCount = 10;
    await repo.update(user);
    const updated = await repo.findById(user.id);
    expect(updated?.winCount).toBe(10);
  });

  it('list/delete', async () => {
    const users = await repo.list();
    expect(users.length).toBeGreaterThan(0);
    await repo.delete(users[0].id);
    const after = await repo.list();
    expect(after.length).toBe(users.length - 1);
  });
}); 