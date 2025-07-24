import { IMatchRepository } from '../../domain/match/match.repository';
import { Match, MatchStatus } from '../../domain/match/match.entity';

export class MatchRepositoryMemory implements IMatchRepository {
  private matches: Map<string, Match> = new Map();

  async create(match: Match): Promise<Match> {
    this.matches.set(match.id, match);
    return match;
  }

  async findById(id: string): Promise<Match | null> {
    return this.matches.get(id) || null;
  }

  async findWaiting(): Promise<Match | null> {
    for (const match of this.matches.values()) {
      if (match.status === MatchStatus.WAITING && !match.user2Id) {
        return match;
      }
    }
    return null;
  }

  async update(match: Match): Promise<Match> {
    this.matches.set(match.id, match);
    return match;
  }

  async delete(id: string): Promise<void> {
    this.matches.delete(id);
  }

  async list(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }
} 