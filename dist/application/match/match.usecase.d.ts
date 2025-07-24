import { IMatchRepository } from '../../domain/match/match.repository';
import { Match } from '../../domain/match/match.entity';
export declare class MatchUseCase {
    private readonly matchRepository;
    constructor(matchRepository: IMatchRepository);
    requestMatch(userId: string): Promise<Match>;
    createMatch(user1Id: string, user2Id: string): Promise<Match>;
    cancelMatch(userId: string): Promise<void>;
    getMatch(id: string): Promise<Match | null>;
}
