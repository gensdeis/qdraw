export enum MatchStatus {
  WAITING = 'WAITING',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export class Match {
  id: string;
  user1Id: string;
  user2Id?: string;
  status: MatchStatus;
  createdAt: Date;

  constructor(
    id: string,
    user1Id: string,
    user2Id?: string,
    status: MatchStatus = MatchStatus.WAITING,
    createdAt: Date = new Date(),
  ) {
    this.id = id;
    this.user1Id = user1Id;
    this.user2Id = user2Id;
    this.status = status;
    this.createdAt = createdAt;
  }
} 