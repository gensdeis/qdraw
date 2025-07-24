import { Room } from './room.entity';

export interface IRoomRepository {
  create(room: Room): Promise<Room>;
  findByCode(code: string): Promise<Room | null>;
  joinRoom(code: string, userId: string): Promise<Room | null>;
  deleteRoom(code: string, userId: string): Promise<void>;
  getRoomInfo(code: string): Promise<Room | null>;
} 