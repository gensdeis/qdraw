import { Socket, Server } from 'socket.io';
export declare class RoomGateway {
    private readonly logger;
    private readonly roomUseCase;
    private readonly matchUseCase;
    private readonly gameUseCase;
    private readyUsers;
    constructor();
    afterInit(server: Server): void;
    handleRoomCreate(client: Socket, data: {
        ownerId: string;
    }): Promise<void>;
    handleRoomJoin(client: Socket, data: {
        code: string;
        userId: string;
    }): Promise<void>;
    handleRoomInfo(client: Socket, data: {
        code: string;
    }): Promise<void>;
    handleRoomDelete(client: Socket, data: {
        code: string;
        userId: string;
    }): Promise<void>;
    handleRoomGameReady(client: Socket, data: {
        code: string;
        userId: string;
    }): Promise<void>;
    handleRoomSendSignal(client: Socket, data: {
        gameId: string;
        matchId: string;
        userId: string;
    }): Promise<void>;
    private gameSignals;
    private judgeRoomGame;
    private broadcastToRoom;
}
