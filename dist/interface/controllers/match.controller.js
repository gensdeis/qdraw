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
exports.MatchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const match_usecase_1 = require("../../application/match/match.usecase");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let MatchController = class MatchController {
    matchUseCase;
    constructor(matchUseCase) {
        this.matchUseCase = matchUseCase;
    }
    async request(req) {
        const userId = req.user.sub;
        const match = await this.matchUseCase.requestMatch(userId);
        return match;
    }
    async cancel(req) {
        const userId = req.user.sub;
        await this.matchUseCase.cancelMatch(userId);
        return { success: true };
    }
    async get(id) {
        return this.matchUseCase.getMatch(id);
    }
};
exports.MatchController = MatchController;
__decorate([
    (0, common_1.Post)('request'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Request Match' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchController.prototype, "request", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel Match' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Match Info' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchController.prototype, "get", null);
exports.MatchController = MatchController = __decorate([
    (0, swagger_1.ApiTags)('Match'),
    (0, common_1.Controller)('match'),
    __metadata("design:paramtypes", [match_usecase_1.MatchUseCase])
], MatchController);
//# sourceMappingURL=match.controller.js.map