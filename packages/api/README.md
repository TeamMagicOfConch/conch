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

### Admin API 클라이언트 (Swagger)

```ts
import { createAdminSwaggerClient, setAuthToken as setAdminAuthToken } from '@conch/api'

const admin = createAdminSwaggerClient('https://admin.magicofconch.site')
setAdminAuthToken(
  /* rest */ null as any,
  /* swagger */ admin as any,
  'your-auth-token',
)

await admin.adminLoginController.login({ osId: 'device-id' })
```

### Conch API 클라이언트 (Swagger)

```ts
import { createConchSwaggerClient } from '@conch/api'

const conch = createConchSwaggerClient('https://test.magicofconch.site')
const res = await conch.authController.login({ osId: 'device-id' })
console.log(res.data)
```

### React Native SSE 헬퍼 (Expo 호환)

```ts
import { submitReviewSSE } from '@conch/api'

await submitReviewSSE({
  baseURL: 'https://test.magicofconch.site',
  // 기본 경로는 '/stream/review'
  review: { body: '오늘은 좋았다', type: 'FEELING' },
  token: 'access-token',
  refreshToken: async () => 'new-access-token',
  login: async () => 'login-access-token',
  onChunk: (text) => console.log(text),
  onError: (err) => console.error(err.message),
  onDone: () => console.log('done'),
})
```

### 타입 생성

Swagger 문서에서 TypeScript 타입을 생성하려면 다음 명령어를 실행하세요:

```bash
# API URL 환경 변수 설정 (선택 사항)
export ADMIN_SWAGGER_URL=https://api.example.com/admin/api-docs/swagger.json
export CONCH_SWAGGER_URL=https://test.magicofconch.site/api-docs

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