"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const common_1 = require("@nestjs/common");
const game_controller_1 = require("./game.controller");
const game_usecase_1 = require("../../application/game/game.usecase");
const game_repository_memory_1 = require("../../infrastructure/game/game.repository.memory");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        controllers: [game_controller_1.GameController],
        providers: [
            {
                provide: 'IGameRepository',
                useClass: game_repository_memory_1.GameRepositoryMemory,
            },
            {
                provide: game_usecase_1.GameUseCase,
                useFactory: (repo) => new game_usecase_1.GameUseCase(repo),
                inject: ['IGameRepository'],
            },
        ],
        exports: [game_usecase_1.GameUseCase],
    })
], GameModule);
//# sourceMappingURL=game.module.js.map