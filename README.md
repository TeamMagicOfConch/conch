# Conch

Expo/React Native 모바일 앱, Vite 어드민 웹, 공유 API 패키지로 구성된 TypeScript 모노레포.

## 프로젝트 구조

```
conch/
├── apps/
│   ├── conch/        # Expo Router 모바일 앱
│   ├── admin/        # Vite + React + Tailwind 어드민 UI
│   └── codiary/      # Vite 교환 일기 웹 서비스
├── packages/
│   └── api/          # 공유 API 클라이언트 + 자동 생성 타입
├── turbo.json
└── pnpm-workspace.yaml
```

### apps/conch

Expo Router 기반 모바일 앱. 리뷰 작성, 홈 피드, 온보딩 플로우 등을 포함한다.

- **라우팅**: Expo Router 그룹 라우트 (`(app)`, `onboard`)
- **주요 기능**: OpenAI SSE 스트리밍, 리뷰 CRUD, 물리 엔진 기반 UI
- **경로 별칭**: `@conch/*`

### apps/admin

Vite + React + Tailwind 기반 어드민 대시보드.

- **라우팅**: React Router DOM
- **경로 별칭**: `@admin/*`

### apps/codiary

Vite + React 교환 일기 웹 서비스. Supabase 백엔드, Radix UI 컴포넌트 사용.

### packages/api

모바일 앱과 어드민에서 공유하는 API 클라이언트 패키지.

- Swagger 문서에서 TypeScript 타입 자동 생성
- Conch / Admin 각각의 클라이언트 팩토리 제공
- SSE 스트리밍 헬퍼 포함
- **경로 별칭**: `@api/*`

## 기술 스택

| 영역      | 기술                                     |
| --------- | ---------------------------------------- |
| 언어      | TypeScript (strict mode)                 |
| 모바일    | Expo SDK 54, React Native 0.81, React 19 |
| 어드민    | Vite 5, React 18, Tailwind CSS           |
| 모노레포  | Turborepo, pnpm 워크스페이스             |
| 코드 품질 | ESLint (Airbnb), Prettier, Husky         |
| API       | Swagger 타입 생성, Axios                 |

## 시작하기

### 요구 사항

- Node.js
- pnpm 9.0.0+

### 설치

```bash
pnpm install
```

### 개발 서버

```bash
# 전체 워크스페이스
pnpm dev

# 모바일 앱만
pnpm dev:conch

# 어드민만
pnpm dev:admin

# 교환 일기만
pnpm dev:codiary
```

### 빌드

```bash
# 전체 빌드
pnpm build

# 개별 빌드
pnpm build:conch
pnpm build:admin
pnpm build:codiary
```

### 기타 명령어

```bash
# 린트
pnpm lint

# 테스트
pnpm test

# API 타입 생성
pnpm --filter @conch/api generate-types

# iOS 시뮬레이터 빌드
pnpm build:conch:simulator
```

## 코드 컨벤션

- **세미콜론 없음**, 싱글 쿼트, trailing comma, print width 160
- **import 순서**: React/RN 코어 → 외부 라이브러리 → 워크스페이스 별칭 → 상대 경로
- **컴포넌트**: PascalCase / **훅**: useCamelCase
- **배럴 export**: 기능 폴더마다 `index.ts` 사용
- `npm`/`yarn` 사용 금지 — `pnpm`만 사용
