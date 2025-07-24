import { GameRepositoryMemory } from './game.repository.memory';
import { Game, GameStatus } from '../../domain/game/game.entity';

describe('GameRepositoryMemory', () => {
  let repo: GameRepositoryMemory;
  beforeEach(() => {
    repo = new GameRepositoryMemory();
  });

  it('create/findById', async () => {
    const game = new Game('1', 'm1', 'u1', 'u2');
    await repo.create(game);
    const found = await repo.findById('1');
    expect(found).toEqual(game);
  });

  it('update', async () => {
    const game = new Game('2', 'm2', 'u1', 'u2');
    await repo.create(game);
    game.status = GameStatus.FINISHED;
    await repo.update(game);
    const updated = await repo.findById('2');
    expect(updated?.status).toBe(GameStatus.FINISHED);
  });

  it('delete', async () => {
    const game = new Game('3', 'm3', 'u1', 'u2');
    await repo.create(game);
    await repo.delete('3');
    const found = await repo.findById('3');
    expect(found).toBeNull();
  });

  it('list', async () => {
    await repo.create(new Game('4', 'm4', 'u1', 'u2'));
    await repo.create(new Game('5', 'm5', 'u1', 'u2'));
    const all = await repo.list();
    expect(all.length).toBe(2);
  });

  it('findByMatchId', async () => {
    const game = new Game('6', 'm6', 'u1', 'u2');
    await repo.create(game);
    const found = await repo.findByMatchId('m6');
    expect(found?.id).toBe('6');
  });
}); 