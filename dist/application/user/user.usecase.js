"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUseCase = void 0;
const user_entity_1 = require("../../domain/user/user.entity");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
class UserUseCase {
    userRepository;
    jwtService;
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async register(username, password) {
        const exists = await this.userRepository.findByUsername(username);
        if (exists)
            throw new Error('Username already exists.');
        const hash = await bcrypt.hash(password, 10);
        const user = new user_entity_1.User((0, uuid_1.v4)(), username, hash);
        return this.userRepository.create(user);
    }
    async login(username, password) {
        const user = await this.userRepository.findByUsername(username);
        if (!user)
            throw new Error('User not found.');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            throw new Error('Password does not match.');
        const token = this.jwtService.sign({ sub: user.id, username: user.username });
        return { user, token };
    }
    async getProfile(id) {
        return this.userRepository.findById(id);
    }
    async updateStatus(id, status) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return null;
        user.status = status;
        return this.userRepository.update(user);
    }
    async addReward(id, amount) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return null;
        user.reward += amount;
        return this.userRepository.update(user);
    }
    async incrementWin(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return null;
        user.winCount += 1;
        user.winStreak += 1;
        if (user.winStreak > user.maxWinStreak) {
            user.maxWinStreak = user.winStreak;
        }
        return this.userRepository.update(user);
    }
    async incrementLose(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return null;
        user.loseCount += 1;
        user.winStreak = 0;
        return this.userRepository.update(user);
    }
    async getWinStreak(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return 0;
        return user.winCount;
    }
    async incrementWinStreak(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return null;
        user.winStreak += 1;
        return this.userRepository.update(user);
    }
    async resetWinStreak(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return null;
        user.winStreak = 0;
        return this.userRepository.update(user);
    }
    async getRewardRanking() {
        const users = await this.userRepository.list();
        return users
            .sort((a, b) => {
            if (b.reward !== a.reward)
                return b.reward - a.reward;
            return a.lastHeartbeat.getTime() - b.lastHeartbeat.getTime();
        })
            .map(u => ({ id: u.id, username: u.username, reward: u.reward, winStreak: u.winStreak }));
    }
    async getWinStreakRanking() {
        const users = await this.userRepository.list();
        return users
            .sort((a, b) => {
            if (b.maxWinStreak !== a.maxWinStreak)
                return b.maxWinStreak - a.maxWinStreak;
            return a.lastHeartbeat.getTime() - b.lastHeartbeat.getTime();
        })
            .map(u => ({ id: u.id, username: u.username, reward: u.reward, winStreak: u.winStreak, maxWinStreak: u.maxWinStreak }));
    }
}
exports.UserUseCase = UserUseCase;
//# sourceMappingURL=user.usecase.js.map