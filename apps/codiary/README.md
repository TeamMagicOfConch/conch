# 교환 일기 (Codiary)

익명 기반의 실시간 교환 일기 웹 서비스입니다. 참여자들이 매일 일기를 작성하고, 랜덤 매칭된 상대방의 일기에 답변을 작성하며, 답변에 대한 리뷰(하이라이트 + 코멘트)를 남기는 세션 기반 교류 플랫폼입니다.

## 주요 기능

### 일반 사용자

- **이메일 로그인**: 이메일만으로 간단하게 인증
- **대기실**: 실시간 참여자 수 확인, 지난 일기 조회
- **일기 작성**: 제한 시간 내 오늘의 일기 작성
- **답변 작성**: 매칭된 상대방의 일기에 답변 작성
- **리뷰 작성**: 받은 답변에 텍스트 하이라이트 및 코멘트 작성
- **지난 일기 캘린더**: 과거 작성한 일기와 답변, 리뷰 조회
- **쿡 찌르기**: 대기실에서 다른 참여자에게 쿡 알림 보내기

### 관리자

- **세션 관리**: 세션 시작, 단계 진행 (일기 작성 → 답변 작성 → 리뷰 → 완료), 강제 종료
- **타이머 제어**: 각 단계별 제한 시간 설정 및 조절
- **매칭 설정**: 지인 제외 기능 (특정 사용자 쌍을 매칭에서 제외)
- **참여자 관리**: 참여자 목록 조회, 사용자 삭제
- **데이터 관리**: 세션 데이터 초기화

## 기술 스택

| 영역         | 기술                                   |
| ------------ | -------------------------------------- |
| 프론트엔드   | React 18 + TypeScript + Vite           |
| 스타일링     | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| 백엔드       | Supabase Edge Functions (Deno + Hono)  |
| 데이터베이스 | Supabase PostgreSQL (KV Store 패턴)    |
| 인증         | 커스텀 토큰 기반 (localStorage 저장)   |
| 배포         | Vercel                                 |

## 프로젝트 구조

```
apps/codiary/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui 컴포넌트
│   │   │   ├── admin/        # 관리자 전용 컴포넌트
│   │   │   ├── user/         # 사용자 컴포넌트
│   │   │   ├── AuthForm.tsx
│   │   │   ├── WaitingRoom.tsx
│   │   │   ├── DiaryEditor.tsx
│   │   │   ├── ResponseEditor.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   └── App.tsx
│   │   └── App.tsx
│   ├── lib/
│   │   └── api.ts            # API 클라이언트
│   └── styles/
│       └── ...
├── supabase/
│   └── functions/
│       └── make-server-1d29bb00/  # Edge Functions
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## API

### 인증

| 메서드 | 엔드포인트      | 설명             |
| ------ | --------------- | ---------------- |
| POST   | `/auth/signin`  | 이메일 로그인    |
| GET    | `/auth/session` | 사용자 정보 조회 |

### 세션

| 메서드 | 엔드포인트              | 설명                      |
| ------ | ----------------------- | ------------------------- |
| GET    | `/session/current`      | 현재 세션 상태 조회       |
| POST   | `/session/join`         | 세션 참가                 |
| POST   | `/session/leave`        | 세션 나가기               |
| GET    | `/session/participants` | 참여자 목록 조회          |
| POST   | `/session/poke`         | 다른 사용자에게 쿡 보내기 |
| POST   | `/session/request-time` | 시간 증가 요청            |

### 일기

| 메서드 | 엔드포인트        | 설명                |
| ------ | ----------------- | ------------------- |
| POST   | `/diary/write`    | 일기 작성           |
| GET    | `/diary/assigned` | 매칭된 일기 조회    |
| GET    | `/diary/history`  | 지난 일기 목록 조회 |

### 답변

| 메서드 | 엔드포인트           | 설명                     |
| ------ | -------------------- | ------------------------ |
| POST   | `/response/write`    | 답변 작성                |
| GET    | `/response/my-diary` | 내 일기에 대한 답변 조회 |

### 리뷰

| 메서드 | 엔드포인트      | 설명                            |
| ------ | --------------- | ------------------------------- |
| POST   | `/review/write` | 리뷰 작성 (하이라이트 + 코멘트) |

### 관리자

| 메서드 | 엔드포인트                | 설명                          |
| ------ | ------------------------- | ----------------------------- |
| GET    | `/admin/users`            | 전체 사용자 목록              |
| POST   | `/admin/session/start`    | 세션 시작                     |
| POST   | `/admin/session/next`     | 다음 단계 진행                |
| POST   | `/admin/session/reset`    | 세션 초기화                   |
| POST   | `/admin/session/timer`    | 타이머 시간 조절              |
| GET    | `/admin/session/statuses` | 참여자별 상태 조회            |
| POST   | `/admin/matching/exclude` | 매칭 제외 설정                |
| GET    | `/admin/matching/config`  | 매칭 설정 조회                |
| POST   | `/admin/user/delete`      | 사용자 삭제                   |
| GET    | `/admin/diary/history`    | 전체 일기 히스토리 (관리자용) |

## 시작하기

### 필수 조건

- Node.js 18 이상
- pnpm

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

### 빌드

```bash
pnpm build
```

## 세션 플로우

```
대기실 (waiting)
    ↓
일기 작성 (writing) - 기본 10분
    ↓
답변 작성 (responding) - 기본 5분
    ↓
리뷰 작성 (reviewing) - 기본 5분
    ↓
완료 (completed)
```

## 환경 변수

| 변수                | 설명                  |
| ------------------- | --------------------- |
| `SUPABASE_URL`      | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Public anon key       |

## 라이선스

내부 프로젝트 / 비공개
