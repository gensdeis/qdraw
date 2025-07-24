@echo off
echo 🚀 개발 서버 시작 (JWT 인증 비활성화)
set DISABLE_JWT_AUTH=true
set NODE_ENV=development
npm run start:dev 