import { GameUseCase } from '../../application/game/game.usecase';
import { SignalType } from '../../domain/game/game.entity';
export declare class GameController {
    private readonly gameUseCase;
    constructor(gameUseCase: GameUseCase);
    create(dto: {
        matchId: string;
        user1Id: string;
        user2Id: string;
    }): Promise<import("../../domain/game/game.entity").Game>;
    sendSignal(id: string, dto: {
        userId: string;
        type: SignalType;
        value: number;
    }): Promise<import("../../domain/game/game.entity").Game | null>;
    get(id: string): Promise<import("../../domain/game/game.entity").Game | null>;
}
