import { UserStatus } from '../../domain/user/user.entity';
export declare class UserOrmEntity {
    id: string;
    username: string;
    password: string;
    winCount: number;
    loseCount: number;
    reward: number;
    winStreak: number;
    maxWinStreak: number;
    status: UserStatus;
    lastHeartbeat: Date;
}
