"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const user_usecase_1 = require("../application/user/user.usecase");
async function createDevUser() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userUseCase = app.get(user_usecase_1.UserUseCase);
    try {
        const user = await userUseCase.register('dev-user', 'dev-password');
        console.log('✅ 개발용 사용자가 생성되었습니다:', {
            id: user.id,
            username: user.username
        });
        const loginResult = await userUseCase.login('dev-user', 'dev-password');
        console.log('🔑 개발용 토큰:', loginResult.token);
        console.log('\n📝 Swagger에서 사용할 토큰:');
        console.log(`Bearer ${loginResult.token}`);
    }
    catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️ 개발용 사용자가 이미 존재합니다.');
            const loginResult = await userUseCase.login('dev-user', 'dev-password');
            console.log('🔑 개발용 토큰:', loginResult.token);
            console.log('\n📝 Swagger에서 사용할 토큰:');
            console.log(`Bearer ${loginResult.token}`);
        }
        else {
            console.error('❌ 오류:', error.message);
        }
    }
    await app.close();
}
createDevUser();
//# sourceMappingURL=create-dev-user.js.map