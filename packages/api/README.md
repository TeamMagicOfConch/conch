# @conch/api

콘치 프로젝트의 API 연동 패키지입니다. 이 패키지는 서버와의 통신을 위한 API 클라이언트를 제공합니다.

## 기능

- Admin API 및 Conch API 클라이언트 제공
- Swagger 문서에서 TypeScript 타입 자동 생성
- 공통 HTTP 클라이언트 제공

## 설치

```bash
pnpm install @conch/api
```

## 사용법

### Admin API 클라이언트 사용

```typescript
import { adminApiClient, setAuthToken } from '@conch/api';

// 인증 토큰 설정
setAuthToken('your-auth-token');

// API 호출
async function fetchUsers() {
  try {
    const users = await adminApiClient.get('/users');
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}
```

### 타입 생성

Swagger 문서에서 TypeScript 타입을 생성하려면 다음 명령어를 실행하세요:

```bash
# API URL 환경 변수 설정 (선택 사항)
export ADMIN_SWAGGER_URL=https://api.example.com/admin/api-docs/swagger.json

# 타입 생성
pnpm generate-types
```

## 개발

```bash
# 개발 모드 실행
pnpm dev

# 빌드
pnpm build

# 린트 실행
pnpm lint
``` 