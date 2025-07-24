import { Match } from './match.entity';
export interface IMatchRepository {
    create(match: Match): Promise<Match>;
    findById(id: string): Promise<Match | null>;
    findWaiting(): Promise<Match | null>;
    update(match: Match): Promise<Match>;
    delete(id: string): Promise<void>;
    list(): Promise<Match[]>;
}
