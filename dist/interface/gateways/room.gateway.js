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
var RoomGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const room_usecase_1 = require("../../application/room/room.usecase");
const room_repository_memory_1 = require("../../infrastructure/room/room.repository.memory");
const match_usecase_1 = require("../../application/match/match.usecase");
const game_usecase_1 = require("../../application/game/game.usecase");
const match_repository_memory_1 = require("../../infrastructure/match/match.repository.memory");
const game_repository_memory_1 = require("../../infrastructure/game/game.repository.memory");
let RoomGateway = RoomGateway_1 = class RoomGateway {
    logger = new common_1.Logger(RoomGateway_1.name);
    roomUseCase;
    matchUseCase;
    gameUseCase;
    readyUsers = new Map();
    constructor() {
        this.roomUseCase = new room_usecase_1.RoomUseCase(new room_repository_memory_1.RoomRepositoryMemory());
        this.matchUseCase = new match_usecase_1.MatchUseCase(new match_repository_memory_1.MatchRepositoryMemory());
        this.gameUseCase = new game_usecase_1.GameUseCase(new game_repository_memory_1.GameRepositoryMemory());
    }
    afterInit(server) {
        this.server = server;
    }
    async handleRoomCreate(client, data) {
        const room = await this.roomUseCase.createRoom(data.ownerId);
        client.emit('room_created', { room });
    }
    async handleRoomJoin(client, data) {
        const room = await this.roomUseCase.joinRoom(data.code, data.userId);
        if (room) {
            client.emit('room_joined', { room });
        }
        else {
            client.emit('room_join_failed', { message: '입장 실패: 방이 없거나 이미 입장 완료됨' });
        }
    }
    async handleRoomInfo(client, data) {
        const room = await this.roomUseCase.getRoomInfo(data.code);
        if (room) {
            client.emit('room_info', { room });
        }
        else {
            client.emit('room_info_failed', { message: '방 정보를 찾을 수 없음' });
        }
    }
    async handleRoomDelete(client, data) {
        await this.roomUseCase.deleteRoom(data.code, data.userId);
        client.emit('room_deleted', { code: data.code });
    }
    async handleRoomGameReady(client, data) {
        if (!this.readyUsers.has(data.code))
            this.readyUsers.set(data.code, new Set());
        this.readyUsers.get(data.code).add(data.userId);
        const room = await this.roomUseCase.getRoomInfo(data.code);
        if (!room)
            return;
        if (room.ownerId && room.guestId && this.readyUsers.get(data.code).has(room.ownerId) && this.readyUsers.get(data.code).has(room.guestId)) {
            this.logger.log(`🎮 방 ${data.code}에서 모든 인원이 게임 준비 완료`);
            const match = await this.matchUseCase.createMatch(room.ownerId, room.guestId);
            this.logger.log(`📋 매치 생성됨: ${match.id} (방: ${data.code})`);
            const game = await this.gameUseCase.createGame(match.id, room.ownerId, room.guestId);
            this.logger.log(`🎮 게임 생성됨: ${game.id} (매치: ${match.id})`);
            this.broadcastToRoom(room, 'room_game_start', {
                code: data.code,
                matchId: match.id,
                gameId: game.id,
                user1Id: room.ownerId,
                user2Id: room.guestId
            });
            const randomCountdown = Math.floor(Math.random() * 3) + 3;
            setTimeout(() => {
                const canFireAt = Date.now();
                const signalPayload = {
                    gameId: game.id,
                    matchId: match.id,
                    timestamp: Date.now(),
                    serverTime: new Date().toISOString(),
                    canFireAt,
                    type: 'CLICK',
                    value: 'START'
                };
                this.broadcastToRoom(room, 'signal', signalPayload);
                this.logger.log(`📡 신호 전송 완료: ${signalPayload.type} (value: ${signalPayload.value})`);
            }, randomCountdown * 1000);
            this.readyUsers.delete(data.code);
        }
        else {
            this.broadcastToRoom(room, 'room_game_ready_status', { code: data.code, readyUsers: Array.from(this.readyUsers.get(data.code)) });
        }
    }
    async handleRoomSendSignal(client, data) {
        const game = await this.gameUseCase.getGameById(data.gameId);
        if (!game)
            return;
        if (!this.gameSignals.has(data.gameId)) {
            this.gameSignals.set(data.gameId, []);
        }
        this.gameSignals.get(data.gameId).push({
            userId: data.userId,
            time: Date.now()
        });
        await this.judgeRoomGame(game, this.gameSignals.get(data.gameId) || []);
    }
    gameSignals = new Map();
    async judgeRoomGame(game, signals) {
        this.logger.log(`[judgeRoomGame] 진입: gameId=${game.id}, signals.length=${signals.length}`);
        if (game.status === 'FINISHED') {
            this.logger.log(`[judgeRoomGame] 이미 FINISHED 상태, 중복 판정 방지`);
            return;
        }
        const match = await this.matchUseCase.getMatch(game.matchId);
        if (!match)
            return;
        let winnerId = null;
        let loserId = null;
        let reason;
        if (signals.length === 1) {
            const signal = signals[0];
            winnerId = signal.userId;
            loserId = signal.userId === match.user1Id ? (match.user2Id || null) : match.user1Id;
            reason = `${winnerId === match.user1Id ? 'user1' : 'user2'} 승리`;
        }
        else if (signals.length === 2) {
            const [signal1, signal2] = signals;
            if (signal1.time < signal2.time) {
                winnerId = signal1.userId;
                loserId = signal2.userId || null;
                reason = `${winnerId === match.user1Id ? 'user1' : 'user2'} 승리 (빠름)`;
            }
            else {
                winnerId = signal2.userId;
                loserId = signal1.userId || null;
                reason = `${winnerId === match.user1Id ? 'user1' : 'user2'} 승리 (빠름)`;
            }
        }
        else {
            this.logger.log(`[judgeRoomGame] signals.length === 0, 무효 경기 처리`);
            reason = '무효(둘 다 신호를 안 보냄)';
            winnerId = null;
            loserId = null;
        }
        game.status = 'FINISHED';
        game.finishedAt = new Date();
        game.winnerId = winnerId;
        game.reward = winnerId ? 1 : 0;
        await this.gameUseCase.updateGame(game);
        const room = await this.roomUseCase.getRoomInfo(game.matchId);
        if (room) {
            this.broadcastToRoom(room, 'game_result', {
                winnerId,
                reward: game.reward,
                gameId: game.id,
                reason,
                winnerUser: winnerId ? { id: winnerId, name: winnerId } : null,
                loserUser: loserId ? { id: loserId, name: loserId } : null,
            });
        }
    }
    async broadcastToRoom(room, event, payload) {
        const server = this.server;
        if (!server)
            return;
        [room.ownerId, room.guestId].forEach(uid => {
            if (!uid)
                return;
            server.emit(event, payload);
        });
    }
};
exports.RoomGateway = RoomGateway;
__decorate([
    (0, websockets_1.SubscribeMessage)('room_create'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleRoomCreate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room_join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleRoomJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room_info'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleRoomInfo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room_delete'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleRoomDelete", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room_game_ready'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleRoomGameReady", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room_send_signal'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleRoomSendSignal", null);
exports.RoomGateway = RoomGateway = RoomGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: true,
        transports: ['websocket', 'polling'],
        namespace: '/room',
    }),
    __metadata("design:paramtypes", [])
], RoomGateway);
//# sourceMappingURL=room.gateway.js.map