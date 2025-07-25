"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const user_controller_1 = require("./user.controller");
const user_usecase_1 = require("../../application/user/user.usecase");
const user_repository_impl_1 = require("../../infrastructure/db/user.repository.impl");
const user_orm_entity_1 = require("../../infrastructure/db/user.orm-entity");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_orm_entity_1.UserOrmEntity]),
            jwt_1.JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '1d' } }),
        ],
        controllers: [user_controller_1.UserController],
        providers: [
            {
                provide: 'IUserRepository',
                useClass: user_repository_impl_1.UserRepositoryImpl,
            },
            {
                provide: user_usecase_1.UserUseCase,
                useFactory: (repo, jwtService) => new user_usecase_1.UserUseCase(repo, jwtService),
                inject: ['IUserRepository', jwt_1.JwtService],
            },
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [user_usecase_1.UserUseCase],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map