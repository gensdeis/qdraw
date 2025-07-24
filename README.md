<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# 동방 퀵드로우 (EasternQuickDraw)

## 프로젝트 설명
- 1:1 실시간 반응속도 대결 게임
- Nest.js + Clean Architecture + TypeORM + sqlite + socket.io 기반
- 매치/게임/유저/점수/상태 관리 및 실시간 처리

## 계층구조
- **도메인**: Entity, Repository Interface (src/domain)
- **애플리케이션**: UseCase, Service (src/application)
- **인프라**: DB/메모리 저장소, 외부 연동 (src/infrastructure)
- **인터페이스**: REST API, 웹소켓 게이트웨이, 컨트롤러, DTO (src/interface)

## 실행 방법
```bash
npm install
npm run start
```
- 기본 포트: 13001
- Swagger: http://localhost:13001/api

## 주요 REST API
- POST   `/user/register`   : 회원가입
- POST   `/user/login`      : 로그인(JWT)
- GET    `/user/me`         : 내 정보 조회
- PATCH  `/user/status`     : 상태 변경
- POST   `/match/request`   : 매치 요청
- POST   `/match/cancel`    : 매치 취소
- GET    `/match/:id`       : 매치 조회
- POST   `/game/create`     : 게임 생성
- POST   `/game/:id/signal` : 신호 전송
- GET    `/game/:id`        : 게임 결과 조회

## 주요 소켓 이벤트 (네임스페이스: `/game`)
- `match_request`   : 매치 요청
- `match_found`     : 매치 성사 (broadcast)
- `match_waiting`   : 매치 대기중
- `room_ready`      : 방 준비 완료
- `signal`          : 신호(정상/가짜) 전송 (broadcast)
- `send_signal`     : 버튼 입력
- `game_result`     : 게임 결과 (broadcast)
- `room_cancel`     : 방 취소 (broadcast)
- `force_end`       : 강제 종료 (broadcast)
- `status_update`   : 상태 변경 (broadcast)
- `error`           : 에러 발생

## 테스트 클라이언트 실행
```bash
npm install socket.io-client
node test-client.js user1
node test-client.js user2
```
- 두 터미널에서 실행하면 end-to-end 시나리오 자동 테스트

## Clean Architecture 폴더 구조
```
src/
  domain/         # 엔티티, 저장소 인터페이스
  application/    # 유스케이스, 서비스
  infrastructure/ # DB/메모리 저장소, 외부 연동
  interface/      # 컨트롤러, 게이트웨이, DTO
```

## 기타
- 모든 주요 API/이벤트는 테스트 코드로 검증됨
- 메모리 매치/게임 저장소, sqlite 유저 저장소
- 확장/리팩토링/테스트 포인트 및 TODO 주석 포함
