# 개발 서버 시작 (JWT 인증 비활성화)
Write-Host "🚀 개발 서버 시작 (JWT 인증 비활성화)" -ForegroundColor Green

$env:DISABLE_JWT_AUTH = "true"
$env:NODE_ENV = "development"

npm run start:dev 