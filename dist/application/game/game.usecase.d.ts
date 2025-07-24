import { IGameRepository } from '../../domain/game/game.repository';
import { Game, SignalType } from '../../domain/game/game.entity';
export declare class GameUseCase {
    private readonly gameRepository;
    constructor(gameRepository: IGameRepository);
    createGame(matchId: string, user1Id: string, user2Id: string): Promise<Game>;
    sendSignal(gameId: string, userId: string, type: SignalType, value: number): Promise<Game | null>;
    finishGame(gameId: string): Promise<Game | null>;
    getGameById(gameId: string): Promise<Game | null>;
    updateGame(game: Game): Promise<Game>;
    private calcReward;
}
