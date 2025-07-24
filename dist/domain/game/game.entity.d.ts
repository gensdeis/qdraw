export declare enum GameStatus {
    WAITING = "WAITING",
    READY = "READY",
    IN_PROGRESS = "IN_PROGRESS",
    FINISHED = "FINISHED"
}
export declare enum SignalType {
    NORMAL = "NORMAL",
    FAKE = "FAKE"
}
export declare class Signal {
    userId: string;
    type: SignalType;
    value: number;
    sentAt: Date;
    constructor(userId: string, type: SignalType, value: number, sentAt?: Date);
}
export declare class Game {
    id: string;
    matchId: string;
    user1Id: string;
    user2Id: string;
    signals: Signal[];
    startedAt: Date;
    finishedAt?: Date;
    winnerId?: string;
    reward: number;
    status: GameStatus;
    constructor(id: string, matchId: string, user1Id: string, user2Id: string, signals?: Signal[], startedAt?: Date, status?: GameStatus, reward?: number, finishedAt?: Date, winnerId?: string);
}
