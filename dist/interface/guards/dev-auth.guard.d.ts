import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class DevAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
