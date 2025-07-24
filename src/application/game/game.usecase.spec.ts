import { GameUseCase } from './game.usecase';
import { IGameRepository } from '../../domain/game/game.repository';
import { Game, GameStatus, Signal, SignalType } from '../../domain/game/game.entity';

describe('GameUseCase', () => {
  let gameRepository: jest.Mocked<IGameRepository>;
  let gameUseCase: GameUseCase;
  let game: Game;

  beforeEach(() => {
    gameRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      findByMatchId: jest.fn(),
    };
    gameUseCase = new GameUseCase(gameRepository);
    game = new Game('gid', 'mid', 'u1', 'u2', [], new Date(), GameStatus.IN_PROGRESS);
  });

  it('createGame: creates game', async () => {
    gameRepository.create.mockImplementation(async (g) => g);
    const result = await gameUseCase.createGame('mid', 'u1', 'u2');
    expect(result.user1Id).toBe('u1');
    expect(result.user2Id).toBe('u2');
  });

  it('sendSignal: adds signal when IN_PROGRESS state', async () => {
    gameRepository.findById.mockResolvedValue(game);
    gameRepository.update.mockImplementation(async (g) => g);
    const result = await gameUseCase.sendSignal('gid', 'u1', SignalType.NORMAL, 1);
    expect(result?.signals.length).toBe(1);
    expect(result?.signals[0].type).toBe(SignalType.NORMAL);
  });

  it('sendSignal: returns null when not IN_PROGRESS', async () => {
    game.status = GameStatus.FINISHED;
    gameRepository.findById.mockResolvedValue(game);
    const result = await gameUseCase.sendSignal('gid', 'u1', SignalType.NORMAL, 1);
    expect(result).toBeNull();
  });

  it('finishGame: first NORMAL signal sender wins and calculates reward', async () => {
    const signal1 = new Signal('u1', SignalType.NORMAL, 1);
    const signal2 = new Signal('u2', SignalType.NORMAL, 1);
    game.signals = [signal1, signal2];
    gameRepository.findById.mockResolvedValue(game);
    gameRepository.update.mockImplementation(async (g) => g);
    
    const result = await gameUseCase.finishGame('gid');
    expect(result?.status).toBe(GameStatus.FINISHED);
    expect(result?.winnerId).toBe('u1');
    expect(result?.reward).toBeGreaterThan(0);
  });

  it('finishGame: returns null if game not found', async () => {
    gameRepository.findById.mockResolvedValue(null);
    const result = await gameUseCase.finishGame('nonexistent');
    expect(result).toBeNull();
  });
}); 