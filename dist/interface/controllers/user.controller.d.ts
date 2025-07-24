import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UserUseCase } from '../../application/user/user.usecase';
import { Request } from 'express';
export declare class UserController {
    private readonly userUseCase;
    constructor(userUseCase: UserUseCase);
    register(dto: RegisterUserDto): Promise<{
        id: string;
        username: string;
    }>;
    login(dto: LoginUserDto): Promise<{
        token: string;
        user: {
            id: string;
            username: string;
            winCount: number;
            loseCount: number;
            reward: number;
            winStreak: number;
        };
    }>;
    me(req: Request): Promise<import("../../domain/user/user.entity").User | null>;
    updateStatus(req: Request, dto: UpdateStatusDto): Promise<import("../../domain/user/user.entity").User | null>;
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
