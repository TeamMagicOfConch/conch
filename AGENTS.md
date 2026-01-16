# AGENTS.md - 콘치 프로젝트 에이전트 가이드

AI 코딩 에이전트를 위한 콘치 프로젝트 개발 가이드입니다.

## 프로젝트 개요

- **프레임워크**: Expo/React Native (모바일 앱), Vite (어드민 웹)
- **언어**: TypeScript (strict mode)
- **패키지 매니저**: pnpm v9.0.0
- **모노레포 도구**: Turborepo
- **코드 품질**: ESLint (Airbnb 스타일) + Prettier + Husky

## 프로젝트 구조

```
conch/
├── apps/
│   ├── conch/          # 메인 모바일 앱 (Expo/React Native)
│   └── admin/          # 어드민 웹 앱 (Vite + React + Tailwind)
├── packages/
│   └── api/            # 공유 API 클라이언트 패키지
└── turbo.json          # Turborepo 설정
```

## 빌드/린트/테스트 명령어

### 루트 디렉토리 명령어

```bash
# 개발 서버
pnpm dev              # 전체 개발 서버 실행
pnpm dev:conch        # conch 앱만 실행
pnpm dev:admin        # admin 앱만 실행

# 빌드
pnpm build            # 전체 빌드
pnpm build:conch      # conch 프로덕션 빌드
pnpm build:admin      # admin 프로덕션 빌드

# 린트 & 테스트
pnpm lint             # 전체 린트 실행
pnpm test             # 전체 테스트 실행
```

### 단일 테스트 실행

```bash
# conch 앱 테스트 (jest-expo 사용)
cd apps/conch
pnpm test                           # 전체 테스트 (watch 모드)
npx jest path/to/file.test.ts       # 특정 파일만 테스트
npx jest --testNamePattern="패턴"    # 특정 테스트만 실행
npx jest --watchAll=false           # watch 모드 없이 실행
```

### 패키지별 명령어

```bash
# packages/api
cd packages/api
pnpm build            # tsup으로 빌드
pnpm dev              # watch 모드
pnpm generate-types   # Swagger에서 타입 생성
```

## 코드 스타일 가이드라인

### Import 순서

1. React/React Native 코어
2. 외부 라이브러리
3. 내부 패키지 (`@conch/api` 등)
4. 로컬 모듈 (`@conch/*`, `@admin/*`)
5. 상대 경로 import

```typescript
// 예시
import { useCallback } from 'react'
import { View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { Slot } from 'expo-router'

import { useRefresh } from '@conch/hooks/useRefresh'
import { login, refreshToken } from '@conch/utils'

import { useStartUp } from './useStartUp'
```

### 포매팅 규칙 (.prettierrc)

- `printWidth`: 160
- `semi`: false (세미콜론 없음)
- `singleQuote`: true
- `trailingComma`: "all"
- `arrowParens`: "always"
- `singleAttributePerLine`: true

### 타입스크립트

- `strict: true` 적용됨
- `as any`, `@ts-ignore`, `@ts-expect-error` 사용 금지
- Props는 inline 타입 또는 별도 interface 정의

```typescript
// 권장: inline 타입
export default function PrimaryButton({
  style,
  onPress,
  children,
  disabled = false,
}: {
  style?: StyleProp<ViewStyle>
  onPress: (e: GestureResponderEvent) => void
  children: ReactNode
  disabled?: boolean
}) { ... }
```

### 네이밍 컨벤션

- **컴포넌트**: PascalCase (`PrimaryButton.tsx`)
- **훅**: camelCase, `use` 접두사 (`useRefresh.ts`)
- **유틸리티**: camelCase (`string.ts`, `date.ts`)
- **상수**: UPPER_SNAKE_CASE 또는 객체 형태
- **테스트 파일**: `__tests__` 디렉토리 내 `*.test.ts`

### 에러 처리

```typescript
// Promise 에러 처리
this.client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

// 조건부 로깅
if (error) console.error(error)
```

### 컴포넌트 스타일

- `StyleSheet.create()` 사용 (React Native)
- Tailwind CSS 사용 (Admin 웹)
- 색상은 `Colors` 객체에서 참조

```typescript
import { Colors } from '@conch/assets/colors'

const innerStyle = StyleSheet.create({
  button: {
    backgroundColor: Colors.onboardingPrimary,
  },
})
```

## Path Alias 설정

```json
{
  "@/*": ["./*"],
  "@api": ["./packages/api/dist/index.d.ts"],
  "@api/*": ["./packages/api/src/*"],
  "@conch/*": ["./apps/conch/*"],
  "@admin/*": ["./apps/admin/*"]
}
```

## ESLint 주요 규칙

- `semi: false` - 세미콜론 사용 안 함
- `no-unused-vars: off` → `@typescript-eslint/no-unused-vars: warn`
- `react/prop-types: off` - TypeScript로 타입 검증
- `import/prefer-default-export: off`
- `react-hooks/rules-of-hooks: error`
- `react-hooks/exhaustive-deps: warn`

## Cursor/Copilot 규칙

### 항상 적용되는 규칙

1. **dotfile은 커밋 대상에서 제외**
2. Airbnb 스타일 가이드 준수
3. pnpm 명령어만 사용 (npm, yarn 금지)
4. 엄격한 TypeScript 타입 체크 준수

### 개발 워크플로우

1. `pnpm dev:conch` - 개발 서버 실행
2. `pnpm build:conch` - 프로덕션 빌드
3. `pnpm build:conch:simulator` - iOS 시뮬레이터용 빌드

## 파일 구조 패턴

### 배럴 파일 (index.ts)

각 디렉토리에 `index.ts`로 re-export:

```typescript
// components/index.ts
export * from './layout'
export * from './common'
export * from './physics'

// utils/index.ts
export * from './string'
export * from './date'
export * from './consts'
export * from './api'
```

### 테스트 파일 위치

```
apps/conch/
├── utils/
│   ├── string.ts
│   └── __tests__/
│       └── string.test.ts
```

## API 클라이언트 사용

```typescript
// Swagger 클라이언트 생성
import { createConchSwaggerClient } from '@conch/api'
const conch = createConchSwaggerClient(process.env.EXPO_PUBLIC_API_URL)

// Auth 헬퍼 생성
import { createConchAuthHelpers } from '@conch/api'
const { login, refreshToken } = createConchAuthHelpers({
  storage: AsyncStorage,
  swaggerClient: conch,
  // ...
})
```

## 환경 변수

- `.env.local` 파일로 관리
- `EXPO_PUBLIC_` 접두사 필요 (Expo 앱에서 접근 시)
- 예: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_DEBUG_JAR`

## 주의사항

1. **빌드 전 테스트**: `turbo.json`에서 test가 build에 의존
2. **타입 생성**: API 타입은 `pnpm generate-types`로 Swagger에서 자동 생성
3. **모노레포 의존성**: 내부 패키지는 `workspace:^` 사용
4. **React 19**: React 19.1.0 사용 중 (최신 버전)
