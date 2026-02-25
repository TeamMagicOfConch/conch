# 교환 일기 (Codiary)

매일 밤 동시에 접속하여 일기를 작성하고, 익명으로 매칭되어 서로의 일기에 답변하며, 답변을 리뷰하는 실시간 세션 기반 웹 서비스입니다.

## 주요 기능

### 사용자 기능

- **간편 로그인**: 이메일만으로 빠르게 로그인
- **실시간 세션**: 대기실 → 일기 작성 → 답변 작성 → 리뷰 → 완료
- **익명 매칭**: 다른 참여자의 일기에 익명으로 답변
- **지난 일기 조회**: 과거 세션의 일기와 답변 확인
- **하이라이트 & 코멘트**: 받은 답변의 특정 텍스트를 하이라이팅하고 코멘트 추가
- **시간 연장 요청**: 타이머 종료 전 시간 연장을 요청할 수 있음
- **쿡 찌르기**: 대기실에서 다른 참여자에게 쿡 메시지 전송

### 관리자 기능

- **세션 관리**: 세션 시작/종료 및 단계 제어 (대기실 → 일기 작성 → 답변 → 리뷰 → 완료)
- **타이머 설정**: 각 단계별 제한 시간 설정 및 조정
- **매칭 설정**: 특정 사용자 쌍을 매칭에서 제외
- **참여자 관리**: 참여자 목록 조회 및 사용자 삭제
- **데이터 관리**: 세션 데이터 조회 및 DB 초기화

## 기술 스택

### Frontend

- React 18 + TypeScript
- Tailwind CSS v4
- Vite (빌드 도구)
- Lucide React (아이콘)
- Radix UI (컴포넌트)
- React Hook Form (폼 관리)
- Recharts (차트)

### Backend

- Supabase Edge Functions (Deno)
- Supabase KV Store (Key-Value 스토어)

## API 엔드포인트

모든 API는 `/make-server-1d29bb00` prefix를 사용합니다.

### 인증 (Auth)

| 메서드 | 엔드포인트      | 설명           |
| ------ | --------------- | -------------- |
| POST   | `/auth/signin`  | 이메일 로그인  |
| POST   | `/auth/signup`  | 사용자 등록    |
| GET    | `/auth/session` | 세션 정보 조회 |

### 세션 (Session)

| 메서드 | 엔드포인트              | 설명                  |
| ------ | ----------------------- | --------------------- |
| GET    | `/session/current`      | 현재 세션 조회        |
| POST   | `/session/join`         | 세션 참여             |
| POST   | `/session/leave`        | 세션 나가기           |
| POST   | `/session/request-time` | 시간 연장 요청        |
| GET    | `/session/participants` | 세션 참여자 목록 조회 |
| POST   | `/session/poke`         | 다른 참여자 쿡 찌르기 |

### 일기 (Diary)

| 메서드 | 엔드포인트        | 설명                |
| ------ | ----------------- | ------------------- |
| POST   | `/diary/write`    | 일기 작성           |
| GET    | `/diary/assigned` | 배정된 일기 조회    |
| GET    | `/diary/history`  | 지난 일기 목록 조회 |

### 답변 (Response)

| 메서드 | 엔드포인트           | 설명                     |
| ------ | -------------------- | ------------------------ |
| POST   | `/response/write`    | 답변 작성                |
| GET    | `/response/my-diary` | 내 일기에 달린 답변 조회 |

### 리뷰 (Review)

| 메서드 | 엔드포인트      | 설명      |
| ------ | --------------- | --------- |
| POST   | `/review/write` | 리뷰 작성 |

### 관리자 (Admin)

| 메서드 | 엔드포인트                | 설명                    |
| ------ | ------------------------- | ----------------------- |
| GET    | `/admin/users`            | 전체 사용자 목록 조회   |
| POST   | `/admin/session/start`    | 세션 시작               |
| POST   | `/admin/session/next`     | 다음 단계로 진행        |
| POST   | `/admin/session/reset`    | 세션 초기화             |
| POST   | `/admin/session/timer`    | 타이머 시간 조정        |
| GET    | `/admin/session/statuses` | 참여자 상태 목록 조회   |
| GET    | `/admin/matching/config`  | 매칭 설정 조회          |
| POST   | `/admin/matching/exclude` | 매칭 제외 설정 저장     |
| GET    | `/admin/matching/result`  | 매칭 결과 조회          |
| POST   | `/admin/user/delete`      | 사용자 삭제             |
| GET    | `/admin/diary/history`    | 전체 일기 히스토리 조회 |

## 시작하기

### 사전 요구사항

- Node.js 18+
- pnpm

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

http://localhost:5173 에서 확인 가능합니다.

### 프로덕션 빌드

```bash
pnpm build
```

## 프로젝트 구조

```
apps/codiary/
├── src/
│   ├── app/
│   │   ├── App.tsx              # 메인 앱 컴포넌트
│   │   └── components/
│   │       ├── DiaryEditor.tsx      # 일기 작성
│   │       ├── ResponseEditor.tsx   # 답변 작성
│   │       ├── ReviewEditor.tsx     # 리뷰 작성
│   │       ├── CalendarView.tsx     # 지난 일기
│   │       ├── WaitingRoom.tsx      # 대기실
│   │       ├── AuthForm.tsx          # 로그인 폼
│   │       ├── admin/                # 관리자 컴포넌트
│   │       └── ui/                   # Radix UI 컴포넌트
│   ├── lib/
│   │   └── api.ts                # API 클라이언트
│   └── styles/                  # 스타일 시트
├── supabase/
│   └── functions/
│       └── make-server-1d29bb00/  # Edge Functions
└── package.json
```

## 세션 플로우

```
대기실 (Waiting)
    ↓
일기 작성 (Writing) - 제한 시간 내 제출
    ↓
답변 작성 (Responding) - 제한 시간 내 제출
    ↓
리뷰 (Reviewing) - 하이라이트 + 코멘트
    ↓
완료 (Completed)
```

## 디자인

- 미니멀한 흑백 디자인
- 노란색 포스트잇 스타일의 일기 카드
- Pretendard 폰트 사용

## 라이선스

내부 프로젝트 / 비공개
