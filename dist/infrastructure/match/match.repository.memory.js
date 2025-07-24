"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchRepositoryMemory = void 0;
const match_entity_1 = require("../../domain/match/match.entity");
class MatchRepositoryMemory {
    matches = new Map();
    async create(match) {
        this.matches.set(match.id, match);
        return match;
    }
    async findById(id) {
        return this.matches.get(id) || null;
    }
    async findWaiting() {
        for (const match of this.matches.values()) {
            if (match.status === match_entity_1.MatchStatus.WAITING && !match.user2Id) {
                return match;
            }
        }
        return null;
    }
    async update(match) {
        this.matches.set(match.id, match);
        return match;
    }
    async delete(id) {
        this.matches.delete(id);
    }
    async list() {
        return Array.from(this.matches.values());
    }
}
exports.MatchRepositoryMemory = MatchRepositoryMemory;
//# sourceMappingURL=match.repository.memory.js.map