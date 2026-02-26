# Codiary (교환 일기)

<img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react" alt="React"> <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript" alt="TypeScript"> <img src="https://img.shields.io/badge/Tailwind_CSS-4.1.12-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind CSS"> <img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat&logo=vite" alt="Vite">

교환 일기는 한국 사용자들이 매일 밤 동시에 접속하여 일기를 작성하고, 익명으로 매칭되어 서로의 일기에 답변하며, 답변을 리뷰하는 실시간 세션 기반 웹 서비스입니다.

## 주요 기능

### 사용자 기능

| 기능               | 설명                                     |
| ------------------ | ---------------------------------------- |
| **간편 로그인**    | 이메일과 이름으로 빠른 인증              |
| **대기실**         | 실시간 참여자 확인, 지난 일기 조회       |
| **일기 작성**      | 제한 시간 내 일기 작성 (포스트잇 스타일) |
| **답변 작성**      | 매칭된 상대방의 일기에 익명 답변         |
| **리뷰**           | 텍스트 하이라이트 및 코멘트 작성         |
| **지난 일기 조회** | 달력 뷰로 과거 세션 기록 확인            |
| **쿡(Poke) 기능**  | 대기실에서 다른 참여자에게 알림 전송     |

### 관리자 기능

| 기능              | 설명                            |
| ----------------- | ------------------------------- |
| **세션 관리**     | 세션 시작, 단계 이동, 종료 제어 |
| **매칭 설정**     | 특정 사용자 쌍을 매칭에서 제외  |
| **참여자 관리**   | 사용자 목록 조회, 사용자 삭제   |
| **히스토리 조회** | 전체 사용자의 세션 기록 확인    |
| **DB 초기화**     | 모든 세션 데이터 삭제           |

## 세션 플로우

```
대기실 → 일기 작성 (10분) → 답변 작성 (5분) → 리뷰 (5분) → 완료
```

1. **대기실**: 참여자 대기, 관리자 세션 시작 대기
2. **일기 작성**: 제한 시간 내 일기 작성, 자동 제출
3. **답변 작성**: 매칭된 상대방 일기에 답변 작성
4. **리뷰**: 받은 답변에 하이라이트 및 코멘트
5. **완료**: 세션 종료, 대기실로 복귀

## 기술 스택

### Frontend

- **React 18** + **TypeScript**
- **Tailwind CSS v4** - 미니멀한 흑백 디자인
- **Vite** - 빌드 도구
- **Radix UI** - 접근성 우선 UI 컴포넌트
- **Lucide React** - 아이콘
- **date-fns** - 날짜 포맷
- **sonner** - 토스트 알림

### Backend

- **Supabase Edge Functions** (Deno 런타임)
- **Supabase KV Store** - 데이터 저장

## API

### 인증 API

| 메서드 | 엔드포인트      | 설명            |
| ------ | --------------- | --------------- |
| POST   | `/auth/signin`  | 이메일로 로그인 |
| GET    | `/auth/session` | 세션 정보 조회  |

### 세션 API

| 메서드 | 엔드포인트              | 설명                    |
| ------ | ----------------------- | ----------------------- |
| GET    | `/session/current`      | 현재 세션 조회          |
| POST   | `/session/join`         | 세션 참여               |
| POST   | `/session/leave`        | 세션 나가기             |
| GET    | `/session/participants` | 참여자 목록 조회        |
| POST   | `/session/poke`         | 다른 사용자에게 쿡 전송 |
| POST   | `/session/request-time` | 시간 연장 요청          |

### 일기 API

| 메서드 | 엔드포인트        | 설명                  |
| ------ | ----------------- | --------------------- |
| POST   | `/diary/write`    | 일기 저장             |
| GET    | `/diary/assigned` | 매칭된 일기 조회      |
| GET    | `/diary/history`  | 내 일기 히스토리 조회 |

### 답변 API

| 메서드 | 엔드포인트           | 설명                     |
| ------ | -------------------- | ------------------------ |
| POST   | `/response/write`    | 답변 저장                |
| GET    | `/response/my-diary` | 내 일기와 받은 답변 조회 |

### 리뷰 API

| 메서드 | 엔드포인트      | 설명      |
| ------ | --------------- | --------- |
| POST   | `/review/write` | 리뷰 저장 |

### 관리자 API

| 메서드 | 엔드포인트                | 설명               |
| ------ | ------------------------- | ------------------ |
| GET    | `/admin/users`            | 전체 사용자 목록   |
| POST   | `/admin/session/start`    | 세션 시작          |
| POST   | `/admin/session/next`     | 다음 단계로 이동   |
| POST   | `/admin/session/reset`    | 세션 초기화        |
| POST   | `/admin/session/timer`    | 타이머 시간 설정   |
| GET    | `/admin/session/statuses` | 참여자 상태 조회   |
| POST   | `/admin/matching/exclude` | 매칭 제외 설정     |
| GET    | `/admin/matching/config`  | 매칭 설정 조회     |
| GET    | `/admin/diary/history`    | 전체 히스토리 조회 |
| POST   | `/admin/user/delete`      | 사용자 삭제        |

## 시작하기

### 필수 조건

- Node.js 18+
- pnpm

### 설치

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### 빌드

```bash
# 프로덕션 빌드
pnpm build
```

### lint 및 타입 검사

```bash
pnpm lint
pnpm typecheck
```

## 프로젝트 구조

```
apps/codiary/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/           # Radix UI 컴포넌트
│   │   │   ├── admin/        # 관리자 컴포넌트
│   │   │   ├── user/         # 사용자 컴포넌트
│   │   │   ├── AuthForm.tsx
│   │   │   ├── WaitingRoom.tsx
│   │   │   ├── DiaryEditor.tsx
│   │   │   ├── ResponseEditor.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   └── App.tsx
│   │   └── lib/
│   │       └── api.ts        # API 클라이언트
│   ├── styles/
│   │   ├── fonts.css
│   │   ├── theme.css
│   │   └── tailwind.css
│   └── main.tsx
├── supabase/
│   └── functions/
│       └── make-server-1d29bb00/  # Edge Functions
├── utils/
│   └── supabase/
│       └── info.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 디자인 시스템

### 컬러

| 용도       | 색상                               |
| ---------- | ---------------------------------- |
| 배경       | `#ffffff`, `#fafafa`               |
| 포스트잇   | `#ffeaa7`                          |
| 텍스트     | `gray-900`, `gray-500`, `gray-400` |
| 하이라이트 | `yellow-100`                       |
| 주요 버튼  | `bg-black`                         |

### 컴포넌트

- **포스트잇**: 노란색 배경, 부드러운 그림자
- **버튼**: 검정색 주요 버튼, 회색 테두리 보조 버튼
- **에디터**: 종이 질감 스타일

## 라이선스

내부 프로젝트 / 비공개
