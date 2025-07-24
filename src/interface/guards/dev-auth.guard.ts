import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class DevAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 개발 환경에서만 사용 가능
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('DevAuthGuard는 개발 환경에서만 사용할 수 있습니다.');
    }

    const request = context.switchToHttp().getRequest();
    
    // 개발용 사용자 정보 설정
    request['user'] = {
      sub: 'dev-user-id',
      username: 'dev-user',
      iat: Date.now(),
      exp: Date.now() + 86400000 // 1일 후
    };

    console.log('🔧 개발 모드: 인증 우회됨');
    return true;
  }
} 