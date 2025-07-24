export type RoomStatus = 'WAITING' | 'READY' | 'DELETED';
export declare class Room {
    id: string;
    code: string;
    ownerId: string;
    guestId?: string;
    status: RoomStatus;
    createdAt: Date;
    deletedAt?: Date;
    constructor(id: string, code: string, ownerId: string, guestId?: string, status?: RoomStatus, createdAt?: Date, deletedAt?: Date);
}
