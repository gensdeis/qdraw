export enum UserStatus {
  IDLE = 'IDLE',
  MATCHING = 'MATCHING',
  IN_GAME = 'IN_GAME',
  OFFLINE = 'OFFLINE',
  WIN = 'WIN',
  LOSE = 'LOSE',
}

export class User {
  id: string;
  username: string;
  password: string; // hash
  winCount: number;
  loseCount: number;
  reward: number;
  status: UserStatus;
  lastHeartbeat: Date;
  winStreak: number;
  maxWinStreak: number;

  constructor(
    id: string,
    username: string,
    password: string,
    winCount = 0,
    loseCount = 0,
    reward = 0,
    status = UserStatus.IDLE,
    lastHeartbeat = new Date(),
    winStreak = 0,
    maxWinStreak = 0,
  ) {
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