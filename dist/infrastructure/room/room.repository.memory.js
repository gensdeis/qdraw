"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRepositoryMemory = void 0;
class RoomRepositoryMemory {
    rooms = new Map();
    async create(room) {
        this.rooms.set(room.code, room);
        return room;
    }
    async findByCode(code) {
        const room = this.rooms.get(code);
        if (!room || room.status === 'DELETED')
            return null;
        return room;
    }
    async joinRoom(code, userId) {
        const room = this.rooms.get(code);
        if (!room || room.status !== 'WAITING' || room.guestId)
            return null;
        room.guestId = userId;
        room.status = 'READY';
        this.rooms.set(code, room);
        return room;
    }
    async deleteRoom(code, userId) {
        const room = this.rooms.get(code);
        if (!room || room.status === 'DELETED')
            return;
        if (room.ownerId !== userId)
            return;
        room.status = 'DELETED';
        room.deletedAt = new Date();
        this.rooms.set(code, room);
    }
    async getRoomInfo(code) {
        const room = this.rooms.get(code);
        if (!room || room.status === 'DELETED')
            return null;
        return room;
    }
}
exports.RoomRepositoryMemory = RoomRepositoryMemory;
//# sourceMappingURL=room.repository.memory.js.map