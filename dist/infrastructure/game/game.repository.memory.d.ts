import { IGameRepository } from '../../domain/game/game.repository';
import { Game } from '../../domain/game/game.entity';
export declare class GameRepositoryMemory implements IGameRepository {
    private games;
    create(game: Game): Promise<Game>;
    findById(id: string): Promise<Game | null>;
    update(game: Game): Promise<Game>;
    delete(id: string): Promise<void>;
    list(): Promise<Game[]>;
    findByMatchId(matchId: string): Promise<Game | null>;
}
