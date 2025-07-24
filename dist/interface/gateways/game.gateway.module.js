"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const game_gateway_1 = require("./game.gateway");
const match_module_1 = require("../controllers/match.module");
const game_module_1 = require("../controllers/game.module");
const user_module_1 = require("../controllers/user.module");
let GameGatewayModule = class GameGatewayModule {
};
exports.GameGatewayModule = GameGatewayModule;
exports.GameGatewayModule = GameGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [match_module_1.MatchModule, game_module_1.GameModule, user_module_1.UserModule],
        providers: [game_gateway_1.GameGateway],
    })
], GameGatewayModule);
//# sourceMappingURL=game.gateway.module.js.map