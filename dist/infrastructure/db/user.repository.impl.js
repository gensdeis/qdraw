"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../domain/user/user.entity");
const user_orm_entity_1 = require("./user.orm-entity");
function toDomain(entity) {
    return new user_entity_1.User(entity.id, entity.username, entity.password, entity.winCount, entity.loseCount, entity.reward, entity.status, entity.lastHeartbeat, entity.winStreak, entity.maxWinStreak);
}
function toOrm(user) {
    const entity = new user_orm_entity_1.UserOrmEntity();
    entity.id = user.id;
    entity.username = user.username;
    entity.password = user.password;
    entity.winCount = user.winCount;
    entity.loseCount = user.loseCount;
    entity.reward = user.reward;
    entity.status = user.status;
    entity.lastHeartbeat = user.lastHeartbeat;
    entity.winStreak = user.winStreak;
    entity.maxWinStreak = user.maxWinStreak;
    return entity;
}
let UserRepositoryImpl = class UserRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findById(id) {
        const entity = await this.repo.findOneBy({ id });
        return entity ? toDomain(entity) : null;
    }
    async findByUsername(username) {
        const entity = await this.repo.findOneBy({ username });
        return entity ? toDomain(entity) : null;
    }
    async create(user) {
        const entity = toOrm(user);
        await this.repo.insert(entity);
        return user;
    }
    async update(user) {
        await this.repo.update(user.id, toOrm(user));
        return user;
    }
    async delete(id) {
        await this.repo.delete(id);
    }
    async list() {
        const entities = await this.repo.find();
        return entities.map(toDomain);
    }
};
exports.UserRepositoryImpl = UserRepositoryImpl;
exports.UserRepositoryImpl = UserRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_orm_entity_1.UserOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserRepositoryImpl);
//# sourceMappingURL=user.repository.impl.js.map