"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomUseCase = void 0;
const room_entity_1 = require("../../domain/room/room.entity");
const uuid_1 = require("uuid");
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
class RoomUseCase {
    roomRepository;
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }
    async createRoom(ownerId) {
        let code;
        let exists;
        do {
            code = generateRoomCode();
            exists = await this.roomRepository.findByCode(code);
        } while (exists);
        const room = new room_entity_1.Room((0, uuid_1.v4)(), code, ownerId, undefined, 'WAITING');
        return this.roomRepository.create(room);
    }
    async joinRoom(code, userId) {
        return this.roomRepository.joinRoom(code, userId);
    }
    async getRoomInfo(code) {
        return this.roomRepository.getRoomInfo(code);
    }
    async deleteRoom(code, userId) {
        return this.roomRepository.deleteRoom(code, userId);
    }
}
exports.RoomUseCase = RoomUseCase;
//# sourceMappingURL=room.usecase.js.map