import { IUserRepository } from '../../domain/user/user.repository';
import { User, UserStatus } from '../../domain/user/user.entity';
import { JwtService } from '@nestjs/jwt';
export declare class UserUseCase {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: IUserRepository, jwtService: JwtService);
    register(username: string, password: string): Promise<User>;
    login(username: string, password: string): Promise<{
        user: User;
        token: string;
    }>;
    getProfile(id: string): Promise<User | null>;
    updateStatus(id: string, status: UserStatus): Promise<User | null>;
    addReward(id: string, amount: number): Promise<User | null>;
    incrementWin(id: string): Promise<User | null>;
    incrementLose(id: string): Promise<User | null>;
    getWinStreak(id: string): Promise<number>;
    incrementWinStreak(id: string): Promise<User | null>;
    resetWinStreak(id: string): Promise<User | null>;
    getRewardRanking(): Promise<{
        id: string;
        username: string;
        reward: number;
        winStreak: number;
    }[]>;
    getWinStreakRanking(): Promise<{
        id: string;
        username: string;
        reward: number;
        winStreak: number;
        maxWinStreak: number;
    }[]>;
}
