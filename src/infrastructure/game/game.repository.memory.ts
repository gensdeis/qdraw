import { IGameRepository } from '../../domain/game/game.repository';
import { Game } from '../../domain/game/game.entity';

export class GameRepositoryMemory implements IGameRepository {
  private games: Map<string, Game> = new Map();

  async create(game: Game): Promise<Game> {
    this.games.set(game.id, game);
    return game;
  }

  async findById(id: string): Promise<Game | null> {
    return this.games.get(id) || null;
  }

  async update(game: Game): Promise<Game> {
    this.games.set(game.id, game);
    return game;
  }

  async delete(id: string): Promise<void> {
    this.games.delete(id);
  }

  async list(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async findByMatchId(matchId: string): Promise<Game | null> {
    for (const game of this.games.values()) {
      if (game.matchId === matchId) return game;
    }
    return null;
  }
} 