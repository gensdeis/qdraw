export type RoomStatus = 'WAITING' | 'READY' | 'DELETED';

export class Room {
  id: string;
  code: string;
  ownerId: string;
  guestId?: string;
  status: RoomStatus;
  createdAt: Date;
  deletedAt?: Date;

  constructor(
    id: string,
    code: string,
    ownerId: string,
    guestId?: string,
    status: RoomStatus = 'WAITING',
    createdAt: Date = new Date(),
    deletedAt?: Date,
  ) {
    this.id = id;
    this.code = code;
    this.ownerId = ownerId;
    this.guestId = guestId;
    this.status = status;
    this.createdAt = createdAt;
    this.deletedAt = deletedAt;
  }
} 