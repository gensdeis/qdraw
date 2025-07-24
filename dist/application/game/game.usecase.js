"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameUseCase = void 0;
const game_entity_1 = require("../../domain/game/game.entity");
const uuid_1 = require("uuid");
class GameUseCase {
    gameRepository;
    constructor(gameRepository) {
        this.gameRepository = gameRepository;
    }
    async createGame(matchId, user1Id, user2Id) {
        const game = new game_entity_1.Game((0, uuid_1.v4)(), matchId, user1Id, user2Id, [], new Date(), game_entity_1.GameStatus.IN_PROGRESS);
        return this.gameRepository.create(game);
    }
    async sendSignal(gameId, userId, type, value) {
        const game = await this.gameRepository.findById(gameId);
        if (!game || game.status !== game_entity_1.GameStatus.IN_PROGRESS)
            return null;
        game.signals.push(new game_entity_1.Signal(userId, type, value));
        return this.gameRepository.update(game);
    }
    async finishGame(gameId) {
        const game = await this.gameRepository.findById(gameId);
        if (!game)
            return null;
        game.status = game_entity_1.GameStatus.FINISHED;
        game.finishedAt = new Date();
        const normalSignals = game.signals.filter(s => s.type === game_entity_1.SignalType.NORMAL);
        if (normalSignals.length >= 1) {
            const winnerSignal = normalSignals[0];
            game.winnerId = winnerSignal.userId;
            game.reward = this.calcReward(winnerSignal, game);
        }
        return this.gameRepository.update(game);
    }
    async getGameById(gameId) {
        return this.gameRepository.findById(gameId);
    }
    async updateGame(game) {
        return this.gameRepository.update(game);
    }
    calcReward(signal, game) {
        if (!game.startedAt)
            return 0;
        const ms = signal.sentAt.getTime() - game.startedAt.getTime();
        if (ms < 300)
            return 100;
        if (ms < 600)
            return 50;
        return 10;
    }
}
exports.GameUseCase = GameUseCase;
//# sourceMappingURL=game.usecase.js.map