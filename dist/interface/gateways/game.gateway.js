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
var GameGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const match_usecase_1 = require("../../application/match/match.usecase");
const game_usecase_1 = require("../../application/game/game.usecase");
const user_usecase_1 = require("../../application/user/user.usecase");
const game_entity_1 = require("../../domain/game/game.entity");
const game_entity_2 = require("../../domain/game/game.entity");
const user_entity_1 = require("../../domain/user/user.entity");
let GameGateway = GameGateway_1 = class GameGateway {
    matchUseCase;
    gameUseCase;
    userUseCase;
    logger = new common_1.Logger(GameGateway_1.name);
    readyUsers = new Map();
    userSocketMap = new Map();
    socketUserMap = new Map();
    gameSignalState = new Map();
    constructor(matchUseCase, gameUseCase, userUseCase) {
        this.matchUseCase = matchUseCase;
        this.gameUseCase = gameUseCase;
        this.userUseCase = userUseCase;
    }
    afterInit(server) {
        this.server = server;
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        let userId = client.handshake.query.userId;
        if (Array.isArray(userId))
            userId = userId[0];
        this.logger.log(`[handleConnection] userId from handshake: ${userId}`);
        if (userId) {
            this.userSocketMap.set(userId, client.id);
            this.socketUserMap.set(client.id, userId);
            this.logger.log(`[handleConnection] userSocketMap: ${userId} -> ${client.id}`);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const userId = this.socketUserMap.get(client.id);
        if (userId) {
            this.userSocketMap.delete(userId);
            this.socketUserMap.delete(client.id);
            this.handleUserDisconnectCleanup(userId);
        }
    }
    async handleUserDisconnectCleanup(userId) {
        for (const [matchId, readySet] of this.readyUsers.entries()) {
            if (readySet.has(userId)) {
                readySet.delete(userId);
                const match = await this.matchUseCase.getMatch(matchId);
                if (match) {
                    this.broadcastToMatch(match, 'status_update', { matchId, userId, status: 'disconnected' });
                }
            }
        }
        for (const [matchId, state] of this.gameSignalState.entries()) {
            const match = await this.matchUseCase.getMatch(matchId);
            if (match && (match.user1Id === userId || match.user2Id === userId)) {
                this.gameSignalState.delete(matchId);
                this.broadcastToMatch(match, 'status_update', { matchId, userId, status: 'signal_reset' });
            }
        }
    }
    async broadcastToMatch(match, event, payload) {
        this.logger.log(`[broadcastToMatch] 호출: event=${event}, payload=${JSON.stringify(payload)}`);
        const server = this.server;
        if (!server)
            return;
        const promises = [match.user1Id, match.user2Id].map(async (uid) => {
            const sid = this.userSocketMap.get(uid);
            this.logger.log(`[broadcastToMatch] event=${event}, uid=${uid}, sid=${sid}`);
            if (sid) {
                return server.to(sid).emit(event, payload);
            }
        });
        await Promise.all(promises);
    }
    getNextSignal(matchId) {
        return { type: game_entity_1.SignalType.NORMAL, value: 1 };
    }
    async handleMatchRequest(client, data) {
        this.logger.log(`[match_request] userId=${data.userId}`);
        const match = await this.matchUseCase.requestMatch(data.userId);
        this.logger.log(`[match_request] matchId=${match.id}, status=${match.status}, user1Id=${match.user1Id}, user2Id=${match.user2Id}`);
        if (match.status === 'READY' && match.user2Id) {
            this.logger.log(`[match_request] 매칭 완료! matchId=${match.id}`);
            await this.broadcastToMatch(match, 'match_found', { match });
        }
        else {
            client.emit('match_waiting', { match });
        }
    }
    async handleRoomReady(client, data) {
        if (!this.readyUsers.has(data.matchId))
            this.readyUsers.set(data.matchId, new Set());
        this.readyUsers.get(data.matchId).add(data.userId);
        const match = await this.matchUseCase.getMatch(data.matchId);
        if (match && match.user1Id && match.user2Id) {
            const readySet = this.readyUsers.get(data.matchId);
            if (readySet.has(match.user1Id) && readySet.has(match.user2Id)) {
                const game = await this.gameUseCase.createGame(data.matchId, match.user1Id, match.user2Id);
                console.log(`🎮 게임 생성됨: ${game.id} (매치: ${data.matchId})`);
                const signal = this.getNextSignal(data.matchId);
                const randomCountdown = Math.floor(Math.random() * 3) + 3;
                const canFireAt = Date.now() + randomCountdown * 1000;
                const signalPayload = {
                    ...signal,
                    gameId: game.id,
                    matchId: data.matchId,
                    timestamp: Date.now(),
                    serverTime: new Date().toISOString(),
                    canFireAt,
                };
                await this.broadcastToMatch(match, 'signal', signalPayload);
                console.log(`📡 신호 전송 완료: ${signal.type} (value: ${signal.value})`);
                setTimeout(() => {
                    setTimeout(async () => {
                        const latestGame = await this.gameUseCase.getGameById(game.id);
                        if (latestGame && latestGame.status !== game_entity_2.GameStatus.FINISHED) {
                            const normalSignals = latestGame.signals.filter(s => s.type === game_entity_1.SignalType.NORMAL);
                            if (normalSignals.length === 0) {
                                latestGame.status = game_entity_2.GameStatus.FINISHED;
                                latestGame.finishedAt = new Date();
                                await this.gameUseCase.updateGame(latestGame);
                                await this.broadcastToMatch(match, 'game_result', {
                                    winnerId: null,
                                    reward: 0,
                                    gameId: latestGame.id,
                                    reason: '무효(둘 다 신호를 보내지 않음)'
                                });
                                this.gameSignalState.delete(game.matchId);
                            }
                        }
                    }, 10000);
                }, 4000);
            }
        }
    }
    async handleSendSignal(client, data) {
        const serverReceiveTime = Date.now();
        const responseTime = data.clientSendTime ? serverReceiveTime - data.clientSendTime : null;
        this.logger.log(`[send_signal] data.gameId: ${data.gameId}, data.userId: ${data.userId}`);
        const game = await this.gameUseCase.sendSignal(data.gameId, data.userId, data.type, data.value);
        if (!game) {
            this.logger.log(`[send_signal] game is null, return`);
            return;
        }
        if (!this.gameSignalState.has(data.gameId)) {
            this.logger.log(`[send_signal] gameSignalState에 새 state 생성: ${data.gameId}`);
            this.gameSignalState.set(data.gameId, { signals: [], timer: null });
        }
        const state = this.gameSignalState.get(data.gameId);
        this.logger.log(`[send_signal] before push signals: ${JSON.stringify(state.signals)}, length: ${state.signals.length}`);
        if (state.signals.find(s => s.userId === data.userId)) {
            this.logger.log(`[send_signal] userId ${data.userId} already sent signal, skipping (return)`);
            return;
        }
        state.signals.push({ userId: data.userId, time: Date.now() });
        this.logger.log(`[send_signal] after push signals: ${JSON.stringify(state.signals)}, length: ${state.signals.length}`);
        if (state.signals.length === 2) {
            this.logger.log(`[send_signal] signals.length === 2, judgeGame 호출`);
            if (state.timer)
                clearTimeout(state.timer);
            this.gameSignalState.delete(data.gameId);
            await this.judgeGame(game, state.signals);
            return;
        }
        if (state.signals.length === 1) {
            this.logger.log(`[send_signal] signals.length === 1, 5초 타이머 시작`);
            state.timer = setTimeout(async () => {
                this.logger.log(`[send_signal] judgeGame 호출 (타이머 5초 만료)`);
                await this.judgeGame(game, state.signals);
                this.gameSignalState.delete(data.gameId);
            }, 5000);
        }
    }
    async judgeGame(game, signals) {
        if (game.status === game_entity_2.GameStatus.FINISHED) {
            this.logger.log(`[judgeGame] 이미 FINISHED 상태, 중복 판정 방지`);
            return;
        }
        const match = await this.matchUseCase.getMatch(game.matchId);
        if (!match) {
            this.logger.error('[judgeGame] match not found');
            return;
        }
        let winnerId = null;
        let loserId = null;
        let reason = '';
        this.logger.log(`[judgeGame] signals: ${JSON.stringify(signals)}`);
        this.logger.log(`[judgeGame] game.user1Id: ${game.user1Id}, game.user2Id: ${game.user2Id}`);
        if (signals.length === 2) {
            signals.sort((a, b) => a.time - b.time);
            winnerId = signals[0].userId;
            loserId = signals[1].userId;
            reason = '정상승(둘 다 신호를 보냄)';
        }
        else if (signals.length === 1) {
            winnerId = signals[0].userId;
            loserId = (game.user1Id === winnerId) ? game.user2Id : game.user1Id;
            reason = '판정승(상대 신호 없음)';
        }
        else {
            reason = '무효(둘 다 신호를 안 보냄)';
        }
        this.logger.log(`[judgeGame] winnerId: ${winnerId}, loserId: ${loserId}, reason: ${reason}`);
        let winnerReward = 0;
        if (winnerId) {
            const winnerUser = await this.userUseCase.getProfile(winnerId);
            const winStreak = (winnerUser && winnerUser.status === user_entity_1.UserStatus.WIN) ? (winnerUser.winCount || 0) : 0;
            winnerReward = 10 + winStreak * 10;
            await this.userUseCase.updateStatus(winnerId, user_entity_1.UserStatus.WIN);
            await this.userUseCase.addReward(winnerId, winnerReward);
            await this.userUseCase.incrementWin(winnerId);
        }
        if (loserId) {
            await this.userUseCase.updateStatus(loserId, user_entity_1.UserStatus.LOSE);
            await this.userUseCase.incrementLose(loserId);
        }
        game.status = game_entity_2.GameStatus.FINISHED;
        game.finishedAt = new Date();
        game.winnerId = winnerId;
        game.reward = winnerReward;
        await this.gameUseCase.updateGame(game);
        await this.broadcastToMatch(match, 'game_result', {
            winnerId,
            reward: winnerReward,
            gameId: game.id,
            reason,
            winnerUser: winnerId ? await this.userUseCase.getProfile(winnerId) : null,
            loserUser: loserId ? await this.userUseCase.getProfile(loserId) : null,
        });
    }
    async handleRoomCancel(client, data) {
        const match = await this.matchUseCase.getMatch(data.matchId);
        if (!match) {
            client.emit('error', { message: 'Invalid matchId' });
            return;
        }
        this.readyUsers.delete(data.matchId);
        this.gameSignalState.delete(data.matchId);
        this.broadcastToMatch(match, 'status_update', { matchId: data.matchId, userId: data.userId, status: 'cancelled' });
    }
    async handleForceEnd(client, data) {
        const match = await this.matchUseCase.getMatch(data.matchId);
        if (!match) {
            client.emit('error', { message: 'Invalid matchId' });
            return;
        }
        this.readyUsers.delete(data.matchId);
        this.gameSignalState.delete(data.matchId);
        this.broadcastToMatch(match, 'status_update', { matchId: data.matchId, status: 'force_ended', reason: data.reason });
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.SubscribeMessage)('match_request'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleMatchRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room_ready'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleRoomReady", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_signal'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleSendSignal", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room_cancel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleRoomCancel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('force_end'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleForceEnd", null);
exports.GameGateway = GameGateway = GameGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: true,
        transports: ['websocket', 'polling'],
        namespace: '/game',
    }),
    __metadata("design:paramtypes", [match_usecase_1.MatchUseCase,
        game_usecase_1.GameUseCase,
        user_usecase_1.UserUseCase])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map