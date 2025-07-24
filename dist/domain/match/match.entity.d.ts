export declare enum MatchStatus {
    WAITING = "WAITING",
    READY = "READY",
    IN_PROGRESS = "IN_PROGRESS",
    FINISHED = "FINISHED"
}
export declare class Match {
    id: string;
    user1Id: string;
    user2Id?: string;
    status: MatchStatus;
    createdAt: Date;
    constructor(id: string, user1Id: string, user2Id?: string, status?: MatchStatus, createdAt?: Date);
}
