import { MatchRepositoryMemory } from './match.repository.memory';
import { Match, MatchStatus } from '../../domain/match/match.entity';

describe('MatchRepositoryMemory', () => {
  let repo: MatchRepositoryMemory;
  beforeEach(() => {
    repo = new MatchRepositoryMemory();
  });

  it('create/findById', async () => {
    const match = new Match('1', 'user1');
    await repo.create(match);
    const found = await repo.findById('1');
    expect(found).toEqual(match);
  });

  it('findWaiting: 대기 중 매칭 반환', async () => {
    const match = new Match('2', 'user2');
    await repo.create(match);
    const waiting = await repo.findWaiting();
    expect(waiting?.id).toBe('2');
  });

  it('update', async () => {
    const match = new Match('3', 'user3');
    await repo.create(match);
    match.status = MatchStatus.READY;
    await repo.update(match);
    const updated = await repo.findById('3');
    expect(updated?.status).toBe(MatchStatus.READY);
  });

  it('delete', async () => {
    const match = new Match('4', 'user4');
    await repo.create(match);
    await repo.delete('4');
    const found = await repo.findById('4');
    expect(found).toBeNull();
  });

  it('list', async () => {
    await repo.create(new Match('5', 'user5'));
    await repo.create(new Match('6', 'user6'));
    const all = await repo.list();
    expect(all.length).toBe(2);
  });
}); 