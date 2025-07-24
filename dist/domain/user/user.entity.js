"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserStatus = void 0;
var UserStatus;
(function (UserStatus) {
    UserStatus["IDLE"] = "IDLE";
    UserStatus["MATCHING"] = "MATCHING";
    UserStatus["IN_GAME"] = "IN_GAME";
    UserStatus["OFFLINE"] = "OFFLINE";
    UserStatus["WIN"] = "WIN";
    UserStatus["LOSE"] = "LOSE";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
class User {
    id;
    username;
    password;
    winCount;
    loseCount;
    reward;
    status;
    lastHeartbeat;
    winStreak;
    maxWinStreak;
    constructor(id, username, password, winCount = 0, loseCount = 0, reward = 0, status = UserStatus.IDLE, lastHeartbeat = new Date(), winStreak = 0, maxWinStreak = 0) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.winCount = winCount;
        this.loseCount = loseCount;
        this.reward = reward;
        this.status = status;
        this.lastHeartbeat = lastHeartbeat;
        this.winStreak = winStreak;
        this.maxWinStreak = maxWinStreak;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map