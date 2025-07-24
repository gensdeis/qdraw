"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRepositoryMemory = void 0;
class GameRepositoryMemory {
    games = new Map();
    async create(game) {
        this.games.set(game.id, game);
        return game;
    }
    async findById(id) {
        return this.games.get(id) || null;
    }
    async update(game) {
        this.games.set(game.id, game);
        return game;
    }
    async delete(id) {
        this.games.delete(id);
    }
    async list() {
        return Array.from(this.games.values());
    }
    async findByMatchId(matchId) {
        for (const game of this.games.values()) {
            if (game.matchId === matchId)
                return game;
        }
        return null;
    }
}
exports.GameRepositoryMemory = GameRepositoryMemory;
//# sourceMappingURL=game.repository.memory.js.map