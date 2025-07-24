import { IRoomRepository } from '../../domain/room/room.repository';
import { Room, RoomStatus } from '../../domain/room/room.entity';

export class RoomRepositoryMemory implements IRoomRepository {
  private rooms: Map<string, Room> = new Map(); // code -> Room

  async create(room: Room): Promise<Room> {
    this.rooms.set(room.code, room);
    return room;
  }

  async findByCode(code: string): Promise<Room | null> {
    const room = this.rooms.get(code);
    if (!room || room.status === 'DELETED') return null;
    return room;
  }

  async joinRoom(code: string, userId: string): Promise<Room | null> {
    const room = this.rooms.get(code);
    if (!room || room.status !== 'WAITING' || room.guestId) return null;
    room.guestId = userId;
    room.status = 'READY';
    this.rooms.set(code, room);
    return room;
  }

  async deleteRoom(code: string, userId: string): Promise<void> {
    const room = this.rooms.get(code);
    if (!room || room.status === 'DELETED') return;
    if (room.ownerId !== userId) return; // 방장만 삭제 가능
    room.status = 'DELETED';
    room.deletedAt = new Date();
    this.rooms.set(code, room);
  }

  async getRoomInfo(code: string): Promise<Room | null> {
    const room = this.rooms.get(code);
    if (!room || room.status === 'DELETED') return null;
    return room;
  }
} 