"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.Signal = exports.SignalType = exports.GameStatus = void 0;
var GameStatus;
(function (GameStatus) {
    GameStatus["WAITING"] = "WAITING";
    GameStatus["READY"] = "READY";
    GameStatus["IN_PROGRESS"] = "IN_PROGRESS";
    GameStatus["FINISHED"] = "FINISHED";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
var SignalType;
(function (SignalType) {
    SignalType["NORMAL"] = "NORMAL";
    SignalType["FAKE"] = "FAKE";
})(SignalType || (exports.SignalType = SignalType = {}));
class Signal {
    userId;
    type;
    value;
    sentAt;
    constructor(userId, type, value, sentAt = new Date()) {
        this.userId = userId;
        this.type = type;
        this.value = value;
        this.sentAt = sentAt;
    }
}
exports.Signal = Signal;
class Game {
    id;
    matchId;
    user1Id;
    user2Id;
    signals;
    startedAt;
    finishedAt;
    winnerId;
    reward;
    status;
    constructor(id, matchId, user1Id, user2Id, signals = [], startedAt = new Date(), status = GameStatus.WAITING, reward = 0, finishedAt, winnerId) {
        this.id = id;
        this.matchId = matchId;
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.signals = signals;
        this.startedAt = startedAt;
        this.status = status;
        this.reward = reward;
        this.finishedAt = finishedAt;
        this.winnerId = winnerId;
    }
}
exports.Game = Game;
//# sourceMappingURL=game.entity.js.map