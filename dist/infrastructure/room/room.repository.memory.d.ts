import { IRoomRepository } from '../../domain/room/room.repository';
import { Room } from '../../domain/room/room.entity';
export declare class RoomRepositoryMemory implements IRoomRepository {
    private rooms;
    create(room: Room): Promise<Room>;
    findByCode(code: string): Promise<Room | null>;
    joinRoom(code: string, userId: string): Promise<Room | null>;
    deleteRoom(code: string, userId: string): Promise<void>;
    getRoomInfo(code: string): Promise<Room | null>;
}
