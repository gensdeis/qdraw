"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = exports.MatchStatus = void 0;
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["WAITING"] = "WAITING";
    MatchStatus["READY"] = "READY";
    MatchStatus["IN_PROGRESS"] = "IN_PROGRESS";
    MatchStatus["FINISHED"] = "FINISHED";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
class Match {
    id;
    user1Id;
    user2Id;
    status;
    createdAt;
    constructor(id, user1Id, user2Id, status = MatchStatus.WAITING, createdAt = new Date()) {
        this.id = id;
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.status = status;
        this.createdAt = createdAt;
    }
}
exports.Match = Match;
//# sourceMappingURL=match.entity.js.map