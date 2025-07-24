import { IMatchRepository } from '../../domain/match/match.repository';
import { Match, MatchStatus } from '../../domain/match/match.entity';
import { v4 as uuidv4 } from 'uuid';

export class MatchUseCase {
  constructor(private readonly matchRepository: IMatchRepository) {}

  async requestMatch(userId: string): Promise<Match> {
    // �̹� ��� ���� ��Ī�� ������ ����, ������ ���� ����
    const waiting = await this.matchRepository.findWaiting();
    if (waiting && !waiting.user2Id) {
      waiting.user2Id = userId;
      waiting.status = MatchStatus.READY;
      return this.matchRepository.update(waiting);
    }
    const match = new Match(uuidv4(), userId);
    return this.matchRepository.create(match);
  }

  async cancelMatch(userId: string): Promise<void> {
    // ��� ���� ��Ī���� ���� ���� ������ ����
    const waiting = await this.matchRepository.findWaiting();
    if (waiting && waiting.user1Id === userId && !waiting.user2Id) {
      await this.matchRepository.delete(waiting.id);
    }
  }

  async getMatch(id: string): Promise<Match | null> {
    return this.matchRepository.findById(id);
  }
} 