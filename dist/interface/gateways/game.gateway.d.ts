import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MatchUseCase } from '../../application/match/match.usecase';
import { GameUseCase } from '../../application/game/game.usecase';
import { UserUseCase } from '../../application/user/user.usecase';
import { SignalType } from '../../domain/game/game.entity';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly matchUseCase;
    private readonly gameUseCase;
    private readonly userUseCase;
    private readonly logger;
    private readyUsers;
    private userSocketMap;
    private socketUserMap;
    private gameSignalState;
    constructor(matchUseCase: MatchUseCase, gameUseCase: GameUseCase, userUseCase: UserUseCase);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private handleUserDisconnectCleanup;
    private broadcastToMatch;
    private getNextSignal;
    handleMatchRequest(client: Socket, data: {
        userId: string;
    }): Promise<void>;
    handleRoomReady(client: Socket, data: {
        matchId: string;
        userId: string;
    }): Promise<void>;
    handleSendSignal(client: Socket, data: {
        gameId: string;
        userId: string;
        type: SignalType;
        value: number;
        clientSendTime?: number;
        serverReceiveTime?: number;
    }): Promise<void>;
    private judgeGame;
    handleRoomCancel(client: Socket, data: {
        matchId: string;
        userId: string;
    }): Promise<void>;
    handleForceEnd(client: Socket, data: {
        matchId: string;
        reason?: string;
    }): Promise<void>;
}
