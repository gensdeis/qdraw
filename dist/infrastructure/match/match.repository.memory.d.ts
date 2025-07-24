import { IMatchRepository } from '../../domain/match/match.repository';
import { Match } from '../../domain/match/match.entity';
export declare class MatchRepositoryMemory implements IMatchRepository {
    private matches;
    create(match: Match): Promise<Match>;
    findById(id: string): Promise<Match | null>;
    findWaiting(): Promise<Match | null>;
    update(match: Match): Promise<Match>;
    delete(id: string): Promise<void>;
    list(): Promise<Match[]>;
}
