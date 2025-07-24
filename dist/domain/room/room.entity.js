"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
class Room {
    id;
    code;
    ownerId;
    guestId;
    status;
    createdAt;
    deletedAt;
    constructor(id, code, ownerId, guestId, status = 'WAITING', createdAt = new Date(), deletedAt) {
        this.id = id;
        this.code = code;
        this.ownerId = ownerId;
        this.guestId = guestId;
        this.status = status;
        this.createdAt = createdAt;
        this.deletedAt = deletedAt;
    }
}
exports.Room = Room;
//# sourceMappingURL=room.entity.js.map