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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const register_user_dto_1 = require("./dto/register-user.dto");
const login_user_dto_1 = require("./dto/login-user.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const user_usecase_1 = require("../../application/user/user.usecase");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const dev_auth_guard_1 = require("../guards/dev-auth.guard");
let UserController = class UserController {
    userUseCase;
    constructor(userUseCase) {
        this.userUseCase = userUseCase;
    }
    async register(dto) {
        const user = await this.userUseCase.register(dto.username, dto.password);
        return { id: user.id, username: user.username };
    }
    async login(dto) {
        const result = await this.userUseCase.login(dto.username, dto.password);
        return {
            token: result.token,
            user: {
                id: result.user.id,
                username: result.user.username,
                winCount: result.user.winCount,
                loseCount: result.user.loseCount,
                reward: result.user.reward,
                winStreak: result.user.winStreak,
                maxWinStreak: result.user.maxWinStreak,
            }
        };
    }
    async me(req) {
        const userId = req.user.sub;
        const user = await this.userUseCase.getProfile(userId);
        return user;
    }
    async updateStatus(req, dto) {
        const userId = req.user.sub;
        const user = await this.userUseCase.updateStatus(userId, dto.status);
        return user;
    }
    async getRewardRanking() {
        return this.userUseCase.getRewardRanking();
    }
    async getWinStreakRanking() {
        return this.userUseCase.getWinStreakRanking();
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: 'User Registration',
        description: 'Register a new user with username and password'
    }),
    (0, swagger_1.ApiBody)({ type: register_user_dto_1.RegisterUserDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User successfully registered',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '53c9c8d3-02c6-4284-8771-a01fd90f0433' },
                username: { type: 'string', example: 'testuser' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Username already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_user_dto_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: 'User Login',
        description: 'Login with username and password to get JWT token'
    }),
    (0, swagger_1.ApiBody)({ type: login_user_dto_1.LoginUserDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '53c9c8d3-02c6-4284-8771-a01fd90f0433' },
                        username: { type: 'string', example: 'testuser' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_user_dto_1.LoginUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get My Profile',
        description: 'Get current user profile information (requires authentication)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '53c9c8d3-02c6-4284-8771-a01fd90f0433' },
                username: { type: 'string', example: 'testuser' },
                winCount: { type: 'number', example: 0 },
                loseCount: { type: 'number', example: 0 },
                reward: { type: 'number', example: 0 },
                status: { type: 'string', example: 'IDLE' },
                lastHeartbeat: { type: 'string', example: '2025-07-24T01:42:28.461Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No token provided or Invalid token' }),
    (0, common_1.UseGuards)(process.env.NODE_ENV === 'development' ? dev_auth_guard_1.DevAuthGuard : jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "me", null);
__decorate([
    (0, common_1.Patch)('status'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update Status',
        description: 'Update user status (requires authentication)'
    }),
    (0, swagger_1.ApiBody)({ type: update_status_dto_1.UpdateStatusDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Status updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '53c9c8d3-02c6-4284-8771-a01fd90f0433' },
                username: { type: 'string', example: 'testuser' },
                status: { type: 'string', example: 'READY' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No token provided or Invalid token' }),
    (0, common_1.UseGuards)(process.env.NODE_ENV === 'development' ? dev_auth_guard_1.DevAuthGuard : jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_status_dto_1.UpdateStatusDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('rank/reward'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getRewardRanking", null);
__decorate([
    (0, common_1.Get)('rank/winstreak'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getWinStreakRanking", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('User'),
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_usecase_1.UserUseCase])
], UserController);
//# sourceMappingURL=user.controller.js.map