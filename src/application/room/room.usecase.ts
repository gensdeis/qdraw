import { IRoomRepository } from '../../domain/room/room.repository';
import { Room, RoomStatus } from '../../domain/room/room.entity';
import { v4 as uuidv4 } from 'uuid';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class RoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async createRoom(ownerId: string): Promise<Room> {
    // 유니크 코드 생성 (중복 방지)
    let code: string;
    let exists: Room | null;
    do {
      code = generateRoomCode();
      exists = await this.roomRepository.findByCode(code);
    } while (exists);
    const room = new Room(uuidv4(), code, ownerId, undefined, 'WAITING');
    return this.roomRepository.create(room);
  }

  async joinRoom(code: string, userId: string): Promise<Room | null> {
    return this.roomRepository.joinRoom(code, userId);
  }

  async getRoomInfo(code: string): Promise<Room | null> {
    return this.roomRepository.getRoomInfo(code);
  }

  async deleteRoom(code: string, userId: string): Promise<void> {
    return this.roomRepository.deleteRoom(code, userId);
  }
} 