"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevAuthGuard = void 0;
const common_1 = require("@nestjs/common");
let DevAuthGuard = class DevAuthGuard {
    async canActivate(context) {
        if (process.env.NODE_ENV !== 'development') {
            throw new Error('DevAuthGuard는 개발 환경에서만 사용할 수 있습니다.');
        }
        const request = context.switchToHttp().getRequest();
        request['user'] = {
            sub: 'dev-user-id',
            username: 'dev-user',
            iat: Date.now(),
            exp: Date.now() + 86400000
        };
        console.log('🔧 개발 모드: 인증 우회됨');
        return true;
    }
};
exports.DevAuthGuard = DevAuthGuard;
exports.DevAuthGuard = DevAuthGuard = __decorate([
    (0, common_1.Injectable)()
], DevAuthGuard);
//# sourceMappingURL=dev-auth.guard.js.map