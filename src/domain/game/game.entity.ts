export enum GameStatus {
  WAITING = 'WAITING',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export enum SignalType {
  NORMAL = 'NORMAL',
  FAKE = 'FAKE',
}

export class Signal {
  userId: string;
  type: SignalType;
  value: number;
  sentAt: Date;

  constructor(userId: string, type: SignalType, value: number, sentAt: Date = new Date()) {
    this.userId = userId;
    this.type = type;
    this.value = value;
    this.sentAt = sentAt;
  }
}

export class Game {
  id: string;
  matchId: string;
  user1Id: string;
  user2Id: string;
  signals: Signal[];
  startedAt: Date;
  finishedAt?: Date;
  winnerId?: string;
  reward: number;
  status: GameStatus;

  constructor(
    id: string,
    matchId: string,
    user1Id: string,
    user2Id: string,
    signals: Signal[] = [],
    startedAt: Date = new Date(),
    status: GameStatus = GameStatus.WAITING,
    reward = 0,
    finishedAt?: Date,
    winnerId?: string,
  ) {
    this.id = id;
    this.matchId = matchId;
    this.user1Id = user1Id;
    this.user2Id = user2Id;
    this.signals = signals;
    this.startedAt = startedAt;
    this.status = status;
    this.reward = reward;
    this.finishedAt = finishedAt;
    this.winnerId = winnerId;
  }
} 