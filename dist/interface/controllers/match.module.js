"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const match_controller_1 = require("./match.controller");
const match_usecase_1 = require("../../application/match/match.usecase");
const match_repository_memory_1 = require("../../infrastructure/match/match.repository.memory");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let MatchModule = class MatchModule {
};
exports.MatchModule = MatchModule;
exports.MatchModule = MatchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '1d' } }),
        ],
        controllers: [match_controller_1.MatchController],
        providers: [
            {
                provide: 'IMatchRepository',
                useClass: match_repository_memory_1.MatchRepositoryMemory,
            },
            {
                provide: match_usecase_1.MatchUseCase,
                useFactory: (repo) => new match_usecase_1.MatchUseCase(repo),
                inject: ['IMatchRepository'],
            },
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [match_usecase_1.MatchUseCase],
    })
], MatchModule);
//# sourceMappingURL=match.module.js.map