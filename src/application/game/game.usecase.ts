import { IGameRepository } from '../../domain/game/game.repository';
import { Game, GameStatus, Signal, SignalType } from '../../domain/game/game.entity';
import { v4 as uuidv4 } from 'uuid';

export class GameUseCase {
  constructor(private readonly gameRepository: IGameRepository) {}

  async createGame(matchId: string, user1Id: string, user2Id: string): Promise<Game> {
    const game = new Game(
      uuidv4(),
      matchId,
      user1Id,
      user2Id,
      [],
      new Date(),
      GameStatus.IN_PROGRESS // 게임 생성 시 바로 IN_PROGRESS로 설정
    );
    return this.gameRepository.create(game);
  }

  async sendSignal(gameId: string, userId: string, type: SignalType, value: number): Promise<Game | null> {
    const game = await this.gameRepository.findById(gameId);
    if (!game || game.status !== GameStatus.IN_PROGRESS) return null;
    game.signals.push(new Signal(userId, type, value));
    return this.gameRepository.update(game);
  }

  async finishGame(gameId: string): Promise<Game | null> {
    const game = await this.gameRepository.findById(gameId);
    if (!game) return null;
    game.status = GameStatus.FINISHED;
    game.finishedAt = new Date();
    // Win/lose logic (Simple: first NORMAL signal sender wins)
    const normalSignals = game.signals.filter(s => s.type === SignalType.NORMAL);
    if (normalSignals.length >= 1) {
      const winnerSignal = normalSignals[0];
      game.winnerId = winnerSignal.userId;
      game.reward = this.calcReward(winnerSignal, game);
    }
    return this.gameRepository.update(game);
  }

  public async getGameById(gameId: string): Promise<Game | null> {
    return this.gameRepository.findById(gameId);
  }

  public async updateGame(game: Game): Promise<Game> {
    return this.gameRepository.update(game);
  }

  private calcReward(signal: Signal, game: Game): number {
    // Response speed based reward calculation (faster = more reward)
    if (!game.startedAt) return 0;
    const ms = signal.sentAt.getTime() - game.startedAt.getTime();
    if (ms < 300) return 100;
    if (ms < 600) return 50;
    return 10;
  }
} 