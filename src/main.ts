import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 추가
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Eastern Quick Draw API')
    .setDescription('Eastern Quick Draw Game API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .addTag('User', 'User management endpoints')
    .addTag('Match', 'Match management endpoints')
    .addTag('Game', 'Game management endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 토큰을 브라우저에 저장
      displayRequestDuration: true, // 요청 시간 표시
      filter: true, // 필터 기능 활성화
      showRequestHeaders: true, // 요청 헤더 표시
    },
    customSiteTitle: 'Eastern Quick Draw API',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #333; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
    `,
  });

  await app.listen(13001, '0.0.0.0');
}
bootstrap();
