import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserUseCase } from '../application/user/user.usecase';

async function createDevUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userUseCase = app.get(UserUseCase);

  try {
    // 개발용 사용자 생성
    const user = await userUseCase.register('dev-user', 'dev-password');
    console.log('✅ 개발용 사용자가 생성되었습니다:', {
      id: user.id,
      username: user.username
    });

    // 로그인하여 토큰 생성
    const loginResult = await userUseCase.login('dev-user', 'dev-password');
    console.log('🔑 개발용 토큰:', loginResult.token);
    console.log('\n📝 Swagger에서 사용할 토큰:');
    console.log(`Bearer ${loginResult.token}`);

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ 개발용 사용자가 이미 존재합니다.');
      
      // 기존 사용자로 로그인
      const loginResult = await userUseCase.login('dev-user', 'dev-password');
      console.log('🔑 개발용 토큰:', loginResult.token);
      console.log('\n📝 Swagger에서 사용할 토큰:');
      console.log(`Bearer ${loginResult.token}`);
    } else {
      console.error('❌ 오류:', error.message);
    }
  }

  await app.close();
}

createDevUser(); 