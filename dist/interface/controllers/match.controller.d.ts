import { MatchUseCase } from '../../application/match/match.usecase';
import { Request } from 'express';
export declare class MatchController {
    private readonly matchUseCase;
    constructor(matchUseCase: MatchUseCase);
    request(req: Request): Promise<import("../../domain/match/match.entity").Match>;
    cancel(req: Request): Promise<{
        success: boolean;
    }>;
    get(id: string): Promise<import("../../domain/match/match.entity").Match | null>;
}
