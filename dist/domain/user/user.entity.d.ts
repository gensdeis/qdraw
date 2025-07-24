export declare enum UserStatus {
    IDLE = "IDLE",
    MATCHING = "MATCHING",
    IN_GAME = "IN_GAME",
    OFFLINE = "OFFLINE",
    WIN = "WIN",
    LOSE = "LOSE"
}
export declare class User {
    id: string;
    username: string;
    password: string;
    winCount: number;
    loseCount: number;
    reward: number;
    status: UserStatus;
    lastHeartbeat: Date;
    winStreak: number;
    maxWinStreak: number;
    constructor(id: string, username: string, password: string, winCount?: number, loseCount?: number, reward?: number, status?: UserStatus, lastHeartbeat?: Date, winStreak?: number, maxWinStreak?: number);
}
