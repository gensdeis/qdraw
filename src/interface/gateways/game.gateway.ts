import { Logger } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MatchUseCase } from '../../application/match/match.usecase';
import { GameUseCase } from '../../application/game/game.usecase';
import { UserUseCase } from '../../application/user/user.usecase';
import { SignalType } from '../../domain/game/game.entity';
import { GameStatus } from '../../domain/game/game.entity';
import { UserStatus } from '../../domain/user/user.entity';

@WebSocketGateway({
  cors: true,
  transports: ['websocket', 'polling'],
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name);
  private readyUsers: Map<string, Set<string>> = new Map(); // matchId -> userId Set
  private userSocketMap: Map<string, string> = new Map(); // userId -> socketId
  private socketUserMap: Map<string, string> = new Map(); // socketId -> userId
  // matchSignalState, fakeCount 등 가짜 신호 관련 상태/코드도 모두 삭제

  // 게임별로 신호 도착 유저, 타이머 관리
  private gameSignalState: Map<string, { signals: { userId: string, time: number }[], timer: NodeJS.Timeout | null }> = new Map();

  constructor(
    private readonly matchUseCase: MatchUseCase,
    private readonly gameUseCase: GameUseCase,
    private readonly userUseCase: UserUseCase,
  ) {}

  afterInit(server: Server) {
    (this as any).server = server;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    let userId = client.handshake.query.userId;
    if (Array.isArray(userId)) userId = userId[0];
    this.logger.log(`[handleConnection] userId from handshake: ${userId}`);
    if (userId) {
      this.userSocketMap.set(userId, client.id);
      this.socketUserMap.set(client.id, userId);
      this.logger.log(`[handleConnection] userSocketMap: ${userId} -> ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(client.id);
      // Cleanup: broadcast and reset for match/game states related to this user
      this.handleUserDisconnectCleanup(userId);
    }
  }

  // Cleanup and reset when user disconnects
  private async handleUserDisconnectCleanup(userId: string) {
    // Remove from match waiting area
    for (const [matchId, readySet] of this.readyUsers.entries()) {
      if (readySet.has(userId)) {
        readySet.delete(userId);
        // Notify others
        const match = await this.matchUseCase.getMatch(matchId);
        if (match) {
          this.broadcastToMatch(match, 'status_update', { matchId, userId, status: 'disconnected' });
        }
      }
    }
    // Reset signal state
    for (const [matchId, state] of this.gameSignalState.entries()) {
      const match = await this.matchUseCase.getMatch(matchId);
      if (match && (match.user1Id === userId || match.user2Id === userId)) {
        this.gameSignalState.delete(matchId);
        this.broadcastToMatch(match, 'status_update', { matchId, userId, status: 'signal_reset' });
      }
    }
    // TODO: Additional cleanup for game leave/exit situations
  }

  private async broadcastToMatch(match: any, event: string, payload: any) {
    this.logger.log(`[broadcastToMatch] 호출: event=${event}, payload=${JSON.stringify(payload)}`);
    const server: Server = (this as any).server;
    if (!server) return;
    
    const promises = [match.user1Id, match.user2Id].map(async (uid) => {
      const sid = this.userSocketMap.get(uid);
      this.logger.log(`[broadcastToMatch] event=${event}, uid=${uid}, sid=${sid}`);
      if (sid) {
        return server.to(sid).emit(event, payload);
      }
    });
    
    await Promise.all(promises);
  }

  // getNextSignal 함수에서 항상 NORMAL 신호만 반환하도록 수정
  private getNextSignal(matchId: string): { type: SignalType; value: number } {
    return { type: SignalType.NORMAL, value: 1 };
  }

  @SubscribeMessage('match_request')
  async handleMatchRequest(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    this.logger.log(`[match_request] userId=${data.userId}`);
    const match = await this.matchUseCase.requestMatch(data.userId);
    this.logger.log(`[match_request] matchId=${match.id}, status=${match.status}, user1Id=${match.user1Id}, user2Id=${match.user2Id}`);
    if (match.status === 'READY' && match.user2Id) {
      this.logger.log(`[match_request] 매칭 완료! matchId=${match.id}`);
      await this.broadcastToMatch(match, 'match_found', { match });
    } else {
      client.emit('match_waiting', { match });
    }
  }

  @SubscribeMessage('room_ready')
  async handleRoomReady(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string; userId: string }) {
    if (!this.readyUsers.has(data.matchId)) this.readyUsers.set(data.matchId, new Set());
    this.readyUsers.get(data.matchId)!.add(data.userId);
    const match = await this.matchUseCase.getMatch(data.matchId);
    if (match && match.user1Id && match.user2Id) {
      const readySet = this.readyUsers.get(data.matchId)!;
      if (readySet.has(match.user1Id) && readySet.has(match.user2Id)) {
        // 게임 자동 생성
        const game = await this.gameUseCase.createGame(data.matchId, match.user1Id, match.user2Id);
        console.log(`🎮 게임 생성됨: ${game.id} (매치: ${data.matchId})`);
        
        const signal = this.getNextSignal(data.matchId);
        // 3~5초 랜덤 카운트다운 후 신호 전송
        const randomCountdown = Math.floor(Math.random() * 3) + 3; // 3,4,5
        setTimeout(async () => {
          const canFireAt = Date.now();
          const signalPayload = { 
            ...signal, 
            gameId: game.id,
            matchId: data.matchId,
            timestamp: Date.now(), // 정확한 타임스탬프 추가
            serverTime: new Date().toISOString(),
            canFireAt, // 버튼 활성화 시각(ms)
          };
          // 병렬로 신호 전송
          await this.broadcastToMatch(match, 'signal', signalPayload);
          console.log(`📡 신호 전송 완료: ${signal.type} (value: ${signal.value})`);
        }, randomCountdown * 1000);
        
        // 4초 카운트다운 후 10초 대기 타이머 시작 (신호 전송 이후에 동작해야 함)
        setTimeout(() => {
          // 10초 대기 타이머 (카운트다운 끝난 뒤)
          setTimeout(async () => {
            const latestGame = await this.gameUseCase.getGameById(game.id);
            if (latestGame && latestGame.status !== GameStatus.FINISHED) {
              // NORMAL 신호를 보낸 유저가 있는지 확인
              const normalSignals = latestGame.signals.filter(s => s.type === SignalType.NORMAL);
              if (normalSignals.length === 0) {
                // 둘 다 신호를 안 보냄: 무효 처리
                latestGame.status = GameStatus.FINISHED;
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
              // 신호가 1개 이상이면 아무 처리도 하지 않음 (판정은 handleSendSignal에서)
            }
          }, 10000); // 10초 대기
        }, (randomCountdown + 4) * 1000); // 신호 전송 이후 4초 + 10초
      }
    }
  }

  @SubscribeMessage('send_signal')
  async handleSendSignal(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string; userId: string; type: SignalType; value: number; clientSendTime?: number; serverReceiveTime?: number }) {
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
    const state = this.gameSignalState.get(data.gameId)!;
    this.logger.log(`[send_signal] before push signals: ${JSON.stringify(state.signals)}, length: ${state.signals.length}`);
    if (state.signals.find(s => s.userId === data.userId)) {
      this.logger.log(`[send_signal] userId ${data.userId} already sent signal, skipping (return)`);
      return;
    }
    state.signals.push({ userId: data.userId, time: Date.now() });
    this.logger.log(`[send_signal] after push signals: ${JSON.stringify(state.signals)}, length: ${state.signals.length}`);
    if (state.signals.length === 2) {
      this.logger.log(`[send_signal] signals.length === 2, judgeGame 호출`);
      if (state.timer) clearTimeout(state.timer);
      this.gameSignalState.delete(data.gameId); // 먼저 삭제해서 중복 방지
      if (game.status !== GameStatus.FINISHED) {
        await this.judgeGame(game, state.signals);
      } else {
        this.logger.log(`[send_signal] game.status is FINISHED, judgeGame 호출하지 않음`);
      }
      return;
    }
    if (state.signals.length === 1) {
      this.logger.log(`[send_signal] signals.length === 1, 5초 타이머 시작`);
      state.timer = setTimeout(async () => {
        this.logger.log(`[send_signal] judgeGame 호출 (타이머 5초 만료)`);
        if (game.status !== GameStatus.FINISHED) {
          await this.judgeGame(game, state.signals);
        } else {
          this.logger.log(`[send_signal] (타이머) game.status is FINISHED, judgeGame 호출하지 않음`);
        }
        this.gameSignalState.delete(data.gameId);
      }, 5000);
    }
  }

  // 게임 판정 및 점수/연승 처리
  private async judgeGame(game: any, signals: { userId: string, time: number }[]) {
    this.logger.log(`[judgeGame] 진입: gameId=${game.id}, signals.length=${signals.length}, game.status=${game.status}`);
    if (game.status === GameStatus.FINISHED) {
      this.logger.log(`[judgeGame] 이미 FINISHED 상태, 중복 판정 방지`);
      return;
    }
    const match = await this.matchUseCase.getMatch(game.matchId);
    if (!match) {
      this.logger.error('[judgeGame] match not found');
      return;
    }
    let winnerId: string | null = null;
    let loserId: string | null = null;
    let reason = '';

    this.logger.log(`[judgeGame] signals: ${JSON.stringify(signals)}`);
    this.logger.log(`[judgeGame] game.user1Id: ${game.user1Id}, game.user2Id: ${game.user2Id}`);

    if (signals.length === 2) {
      signals.sort((a, b) => a.time - b.time);
      winnerId = signals[0].userId;
      loserId = signals[1].userId;
      reason = '정상승(둘 다 신호를 보냄)';
    } else if (signals.length === 1) {
      winnerId = signals[0].userId;
      loserId = (game.user1Id === winnerId) ? game.user2Id : game.user1Id;
      reason = '판정승(상대 신호 없음)';
    } else {
      // 무효 경기: 아무 기록도 변경하지 않음
      this.logger.log(`[judgeGame] signals.length === 0, 무효 경기 처리. 승/패/연승 기록 변경 없음.`);
      reason = '무효(둘 다 신호를 안 보냄)';
      winnerId = null;
      loserId = null;
      // 게임 상태만 FINISHED로 변경
      game.status = GameStatus.FINISHED;
      game.finishedAt = new Date();
      game.winnerId = null;
      game.reward = 0;
      await this.gameUseCase.updateGame(game);
      await this.broadcastToMatch(match, 'game_result', {
        winnerId: null,
        reward: 0,
        gameId: game.id,
        reason,
        winnerUser: null,
        loserUser: null,
      });
      return;
    }

    this.logger.log(`[judgeGame] winnerId: ${winnerId}, loserId: ${loserId}, reason: ${reason}`);

    // 점수 및 연승 처리
    let winnerReward = 0;
    if (winnerId) {
      // 연승수 가져오기
      const winnerUser = await this.userUseCase.getProfile(winnerId);
      const winStreak = (winnerUser && winnerUser.status === UserStatus.WIN) ? (winnerUser.winCount || 0) : 0;
      winnerReward = 10 + winStreak * 10;
      await this.userUseCase.updateStatus(winnerId, UserStatus.WIN);
      await this.userUseCase.addReward(winnerId, winnerReward);
      await this.userUseCase.incrementWin(winnerId);
    }
    if (loserId) {
      await this.userUseCase.updateStatus(loserId, UserStatus.LOSE);
      await this.userUseCase.incrementLose(loserId);
    }

    // 게임 상태 업데이트
    game.status = GameStatus.FINISHED;
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

  @SubscribeMessage('room_cancel')
  async handleRoomCancel(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string; userId: string }) {
    const match = await this.matchUseCase.getMatch(data.matchId);
    if (!match) {
      client.emit('error', { message: 'Invalid matchId' });
      return;
    }
    // Reset ready state
    this.readyUsers.delete(data.matchId);
    this.gameSignalState.delete(data.matchId);
    this.broadcastToMatch(match, 'status_update', { matchId: data.matchId, userId: data.userId, status: 'cancelled' });
  }

  @SubscribeMessage('force_end')
  async handleForceEnd(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string; reason?: string }) {
    const match = await this.matchUseCase.getMatch(data.matchId);
    if (!match) {
      client.emit('error', { message: 'Invalid matchId' });
      return;
    }
    // Reset all states
    this.readyUsers.delete(data.matchId);
    this.gameSignalState.delete(data.matchId);
    this.broadcastToMatch(match, 'status_update', { matchId: data.matchId, status: 'force_ended', reason: data.reason });
  }
} 