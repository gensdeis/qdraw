import { Game } from './game.entity';
export interface IGameRepository {
    create(game: Game): Promise<Game>;
    findById(id: string): Promise<Game | null>;
    update(game: Game): Promise<Game>;
    delete(id: string): Promise<void>;
    list(): Promise<Game[]>;
    findByMatchId(matchId: string): Promise<Game | null>;
}
