"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const user_module_1 = require("./interface/controllers/user.module");
const user_orm_entity_1 = require("./infrastructure/db/user.orm-entity");
const match_module_1 = require("./interface/controllers/match.module");
const game_module_1 = require("./interface/controllers/game.module");
const game_gateway_module_1 = require("./interface/gateways/game.gateway.module");
const room_gateway_module_1 = require("./interface/gateways/room.gateway.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: 'db.sqlite',
                entities: [user_orm_entity_1.UserOrmEntity],
                synchronize: true,
            }),
            jwt_1.JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '1d' } }),
            user_module_1.UserModule,
            match_module_1.MatchModule,
            game_module_1.GameModule,
            game_gateway_module_1.GameGatewayModule,
            room_gateway_module_1.RoomGatewayModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map