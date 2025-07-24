import { IMatchRepository } from '../../domain/match/match.repository';
import { Match, MatchStatus } from '../../domain/match/match.entity';
import { v4 as uuidv4 } from 'uuid';

export class MatchUseCase {
  constructor(private readonly matchRepository: IMatchRepository) {}

  async requestMatch(userId: string): Promise<Match> {
    // 이미 대기 중인 매치가 있으면 참가, 없으면 새로 생성
    const waiting = await this.matchRepository.findWaiting();
    if (waiting && !waiting.user2Id) {
      waiting.user2Id = userId;
      waiting.status = MatchStatus.READY;
      return this.matchRepository.update(waiting);
    }
    const match = new Match(uuidv4(), userId);
    return this.matchRepository.create(match);
  }

  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    // 방에서 게임 시작 시 직접 매치 생성
    const match = new Match(uuidv4(), user1Id);
    match.user2Id = user2Id;
    match.status = MatchStatus.READY;
    return this.matchRepository.create(match);
  }

  async cancelMatch(userId: string): Promise<void> {
    // 대기 중인 매치에서 사용자가 취소하면 매치 삭제
    const waiting = await this.matchRepository.findWaiting();
    if (waiting && waiting.user1Id === userId && !waiting.user2Id) {
      await this.matchRepository.delete(waiting.id);
    }
  }

  async getMatch(id: string): Promise<Match | null> {
    return this.matchRepository.findById(id);
  }
} 