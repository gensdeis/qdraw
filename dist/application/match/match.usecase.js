"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchUseCase = void 0;
const match_entity_1 = require("../../domain/match/match.entity");
const uuid_1 = require("uuid");
class MatchUseCase {
    matchRepository;
    constructor(matchRepository) {
        this.matchRepository = matchRepository;
    }
    async requestMatch(userId) {
        const waiting = await this.matchRepository.findWaiting();
        if (waiting && !waiting.user2Id) {
            waiting.user2Id = userId;
            waiting.status = match_entity_1.MatchStatus.READY;
            return this.matchRepository.update(waiting);
        }
        const match = new match_entity_1.Match((0, uuid_1.v4)(), userId);
        return this.matchRepository.create(match);
    }
    async cancelMatch(userId) {
        const waiting = await this.matchRepository.findWaiting();
        if (waiting && waiting.user1Id === userId && !waiting.user2Id) {
            await this.matchRepository.delete(waiting.id);
        }
    }
    async getMatch(id) {
        return this.matchRepository.findById(id);
    }
}
exports.MatchUseCase = MatchUseCase;
//# sourceMappingURL=match.usecase.js.map