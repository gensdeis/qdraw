import { IRoomRepository } from '../../domain/room/room.repository';
import { Room } from '../../domain/room/room.entity';
export declare class RoomUseCase {
    private readonly roomRepository;
    constructor(roomRepository: IRoomRepository);
    createRoom(ownerId: string): Promise<Room>;
    joinRoom(code: string, userId: string): Promise<Room | null>;
    getRoomInfo(code: string): Promise<Room | null>;
    deleteRoom(code: string, userId: string): Promise<void>;
}
