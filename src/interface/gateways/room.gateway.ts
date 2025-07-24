import { Logger } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { RoomUseCase } from '../../application/room/room.usecase';
import { RoomRepositoryMemory } from '../../infrastructure/room/room.repository.memory';
import { MatchUseCase } from '../../application/match/match.usecase';
import { GameUseCase } from '../../application/game/game.usecase';
import { MatchRepositoryMemory } from '../../infrastructure/match/match.repository.memory';
import { GameRepositoryMemory } from '../../infrastructure/game/game.repository.memory';

@WebSocketGateway({
  cors: true,
  transports: ['websocket', 'polling'],
  namespace: '/room',
})
export class RoomGateway {
  private readonly logger = new Logger(RoomGateway.name);
  private readonly roomUseCase: RoomUseCase;
  private readonly matchUseCase: MatchUseCase;
  private readonly gameUseCase: GameUseCase;
  private readyUsers: Map<string, Set<string>> = new Map(); // code -> userId Set

  constructor() {
    this.roomUseCase = new RoomUseCase(new RoomRepositoryMemory());
    this.matchUseCase = new MatchUseCase(new MatchRepositoryMemory());
    this.gameUseCase = new GameUseCase(new GameRepositoryMemory());
  }

  afterInit(server: Server) {
    (this as any).server = server;
  }

  @SubscribeMessage('room_create')
  async handleRoomCreate(@ConnectedSocket() client: Socket, @MessageBody() data: { ownerId: string }) {
    const room = await this.roomUseCase.createRoom(data.ownerId);
    client.emit('room_created', { room });
  }

  @SubscribeMessage('room_join')
  async handleRoomJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { code: string; userId: string }) {
    const room = await this.roomUseCase.joinRoom(data.code, data.userId);
    if (room) {
      client.emit('room_joined', { room });
    } else {
      client.emit('room_join_failed', { message: '입장 실패: 방이 없거나 이미 입장 완료됨' });
    }
  }

  @SubscribeMessage('room_info')
  async handleRoomInfo(@ConnectedSocket() client: Socket, @MessageBody() data: { code: string }) {
    const room = await this.roomUseCase.getRoomInfo(data.code);
    if (room) {
      client.emit('room_info', { room });
    } else {
      client.emit('room_info_failed', { message: '방 정보를 찾을 수 없음' });
    }
  }

  @SubscribeMessage('room_delete')
  async handleRoomDelete(@ConnectedSocket() client: Socket, @MessageBody() data: { code: string; userId: string }) {
    await this.roomUseCase.deleteRoom(data.code, data.userId);
    client.emit('room_deleted', { code: data.code });
  }

  @SubscribeMessage('room_game_ready')
  async handleRoomGameReady(@ConnectedSocket() client: Socket, @MessageBody() data: { code: string; userId: string }) {
    if (!this.readyUsers.has(data.code)) this.readyUsers.set(data.code, new Set());
    this.readyUsers.get(data.code)!.add(data.userId);
    const room = await this.roomUseCase.getRoomInfo(data.code);
    if (!room) return;
    if (room.ownerId && room.guestId && this.readyUsers.get(data.code)!.has(room.ownerId) && this.readyUsers.get(data.code)!.has(room.guestId)) {
      // 모든 인원이 준비 완료 - 게임 시작
      this.logger.log(`🎮 방 ${data.code}에서 모든 인원이 게임 준비 완료`);
      
      // 1. Match 생성
      const match = await this.matchUseCase.createMatch(room.ownerId, room.guestId);
      this.logger.log(`📋 매치 생성됨: ${match.id} (방: ${data.code})`);
      
      // 2. Game 생성
      const game = await this.gameUseCase.createGame(match.id, room.ownerId, room.guestId);
      this.logger.log(`🎮 게임 생성됨: ${game.id} (매치: ${match.id})`);
      
      // 3. 클라이언트들에게 게임 시작 알림
      this.broadcastToRoom(room, 'room_game_start', { 
        code: data.code,
        matchId: match.id,
        gameId: game.id,
        user1Id: room.ownerId,
        user2Id: room.guestId
      });
      
      // 4. 3-5초 후 신호 전송
      const randomCountdown = Math.floor(Math.random() * 3) + 3; // 3,4,5초
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
    } else {
      this.broadcastToRoom(room, 'room_game_ready_status', { code: data.code, readyUsers: Array.from(this.readyUsers.get(data.code)!) });
    }
  }

  @SubscribeMessage('room_send_signal')
  async handleRoomSendSignal(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string; matchId: string; userId: string }) {
    // 방에서 게임 신호 처리
    const game = await this.gameUseCase.getGameById(data.gameId);
    if (!game) return;
    
    // 신호 기록
    if (!this.gameSignals.has(data.gameId)) {
      this.gameSignals.set(data.gameId, []);
    }
    this.gameSignals.get(data.gameId)!.push({
      userId: data.userId,
      time: Date.now()
    });
    
    // 게임 판정
    await this.judgeRoomGame(game, this.gameSignals.get(data.gameId) || []);
  }

  private gameSignals: Map<string, { userId: string; time: number }[]> = new Map();

  private async judgeRoomGame(game: any, signals: { userId: string; time: number }[]) {
    this.logger.log(`[judgeRoomGame] 진입: gameId=${game.id}, signals.length=${signals.length}`);
    
    if (game.status === 'FINISHED') {
      this.logger.log(`[judgeRoomGame] 이미 FINISHED 상태, 중복 판정 방지`);
      return;
    }
    
    const match = await this.matchUseCase.getMatch(game.matchId);
    if (!match) return;
    
    let winnerId: string | null = null;
    let loserId: string | null = null;
    let reason: string;
    
    if (signals.length === 1) {
      // 한 명만 신호를 보낸 경우
      const signal = signals[0];
      winnerId = signal.userId;
      loserId = signal.userId === match.user1Id ? (match.user2Id || null) : match.user1Id;
      reason = `${winnerId === match.user1Id ? 'user1' : 'user2'} 승리`;
    } else if (signals.length === 2) {
      // 둘 다 신호를 보낸 경우
      const [signal1, signal2] = signals;
      if (signal1.time < signal2.time) {
        winnerId = signal1.userId;
        loserId = signal2.userId || null;
        reason = `${winnerId === match.user1Id ? 'user1' : 'user2'} 승리 (빠름)`;
      } else {
        winnerId = signal2.userId;
        loserId = signal1.userId || null;
        reason = `${winnerId === match.user1Id ? 'user1' : 'user2'} 승리 (빠름)`;
      }
    } else {
      // 신호를 보낸 사람이 없는 경우
      this.logger.log(`[judgeRoomGame] signals.length === 0, 무효 경기 처리`);
      reason = '무효(둘 다 신호를 안 보냄)';
      winnerId = null;
      loserId = null;
    }
    
    // 게임 상태 업데이트
    game.status = 'FINISHED';
    game.finishedAt = new Date();
    game.winnerId = winnerId;
    game.reward = winnerId ? 1 : 0;
    await this.gameUseCase.updateGame(game);
    
    // 결과 브로드캐스트
    const room = await this.roomUseCase.getRoomInfo(game.matchId); // 임시로 matchId를 code로 사용
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

  private async broadcastToRoom(room: any, event: string, payload: any) {
    const server: Server = (this as any).server;
    if (!server) return;
    // 방장, 게스트 모두에게 전송
    [room.ownerId, room.guestId].forEach(uid => {
      if (!uid) return;
      // NOTE: 클라이언트가 여러 소켓을 쓸 수 있으므로, 실제로는 userId->socketId 매핑이 필요할 수 있음
      // 여기서는 단순히 모든 소켓에 broadcast
      server.emit(event, payload);
    });
  }
} 