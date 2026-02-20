# 교환 일기 웹 서비스 - 기능명세서

## 📋 프로젝트 개요

**교환 일기**는 한국 사용자들이 매일 밤 동시에 접속하여 일기를 작성하고, 익명으로 매칭되어 서로의 일기에 답변하며, 답변을 리뷰하는 실시간 세션 기반 웹 서비스입니다.

### 주요 특징

- 실시간 타이머 기반 세션 진행
- 익명 매칭 시스템
- 관리자 주도의 세션 관리
- 지인 매칭 제외 기능
- 미니멀한 흑백 디자인

---

## 👥 사용자 역할

### 1. 일반 사용자

- 이메일과 이름으로 간단 로그인
- 세션 참여 및 일기 작성
- 매칭된 상대의 일기에 답변
- 받은 답변 리뷰
- 과거 일기 및 답변 조회

### 2. 관리자 (conch.of.magic@gmail.com)

- 세션 시작/종료 권한
- 실시간 세션 단계 제어
- 매칭 설정 (지인 제외 설정)
- 참여자 목록 및 히스토리 조회
- 데이터베이스 초기화

---

## 🔄 세션 플로우

### 세션 단계

```
대기실 → 일기 작성 → 답변 작성 → 리뷰 → 완료
```

### 1. 대기실 (Waiting)

**일반 사용자**

- 실시간 참여자 수 확인
- 관리자의 세션 시작 대기
- 지난 일기 조회 가능
- 하단 종료 버튼

**관리자**

- 참여자 목록 카드 뷰
- 세션 시작 버튼
- 매칭 설정 버튼
- DB 초기화 버튼
- 참여자 클릭 시 히스토리 조회

### 2. 일기 작성 (Writing)

- **제한 시간**: 관리자가 설정 (기본값 예: 10분)
- 상단 중앙 타이머 표시
- 종이 질감의 에디터
- 우측 상단 로그아웃 버튼
- 시간 종료 시 자동 제출

### 3. 답변 작성 (Responding)

- **제한 시간**: 관리자가 설정 (기본값 예: 5분)
- 2단 레이아웃
  - 좌측: 매칭된 상대의 일기 (노란색 포스트잇 스타일, 480px 고정 너비)
  - 우측: 답변 작성 영역 (흰 배경, 줄글)
- 상단 중앙 타이머 표시
- **시간 종료 시 현재 내용 자동 제출** (빈 내용도 제출됨)
- 제출 완료 버튼 비활성화

### 4. 리뷰 (Reviewing)

- **제한 시간**: 관리자가 설정 (기본값 예: 5분)
- 2단 레이아웃
  - 좌측: 내가 쓴 일기 (노란색 포스트잇)
  - 우측: 받은 답변 (텍스트 선택하여 하이라이트 가능)
- 하이라이트 기능: 드래그하여 텍스트 선택
- 코멘트 작성 가능
- 시간 종료 시 자동 제출

### 5. 완료 (Completed)

- 세션 완료 메시지
- 대기실로 복귀

---

## 🎨 디자인 시스템

### 컬러

- **주 배경**: 흰색 (`#ffffff`)
- **보조 배경**: 연한 회색 (`#fafafa`)
- **포스트잇**: 노란색 (`#ffeaa7`)
- **텍스트**:
  - 주요: `text-gray-900`
  - 보조: `text-gray-500`, `text-gray-400`
- **하이라이트**: `bg-yellow-100` (연한 노란색)
- **강조 버튼**: 검정 (`bg-black`)

### 타이포그래피

- **폰트**: Pretendard
- **제목**: `text-2xl`, `text-3xl` - `font-normal tracking-tight`
- **본문**: `leading-relaxed`

### 컴포넌트 스타일

- **포스트잇 카드**:
  - 배경: `bg-[#ffeaa7]`
  - 그림자: `0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)`
  - 라운드 없음
- **버튼**:
  - 주요: `bg-black hover:bg-gray-800 text-white`
  - 보조: `border-gray-200` outline
  - 종료: `border-gray-300 text-gray-600`

- **레이아웃**:
  - 2단 분할: 좌측 480px 고정, 우측 flex-1 max-w-2xl
  - 8px 간격 (`gap-8`)

---

## 🔐 인증 시스템

### 로그인 방식

- **간단 이메일 인증**
  - 이메일과 이름 입력
  - Supabase Auth 완전 제거
  - 로컬스토리지 기반 토큰 관리

### 토큰 관리

- 로그인 시 서버에서 토큰 발급
- `localStorage`에 토큰 저장
- API 요청 시 `X-User-Token` 헤더로 전송

### 관리자 권한

- `conch.of.magic@gmail.com`만 관리자 권한 부여
- 서버에서 이메일 확인하여 권한 부여

---

## 📱 주요 기능

### 1. 매칭 시스템

- **자동 매칭**: 참여자 간 1:1 매칭
- **지인 제외 설정**:
  - 관리자가 특정 사용자 쌍을 매칭에서 제외
  - 예: A와 B가 지인이면 서로 매칭되지 않음
  - 설정은 세션 간 유지됨
  - 새로고침해도 데이터 유지 (`hasLoaded` 플래그)

### 2. 실시간 세션 제어 (관리자)

- **단계별 제어**:
  - 일기 작성 시작
  - 답변 작성 시작
  - 리뷰 시작
  - 세션 종료
- **타이머 설정**: 각 단계별 제한 시간 설정
- **실시간 타이머 동기화**: 모든 사용자에게 동일한 남은 시간 표시

### 3. 자동 제출 시스템

- **일기 작성**: 타이머 종료 시 자동 제출
- **답변 작성**: 타이머 종료 시 현재 내용 자동 제출 (빈 내용도 제출)
- **리뷰**: 타이머 종료 시 자동 제출

### 4. 지난 일기 조회

- **목록 뷰**:
  - 7열 그리드 레이아웃
  - 최신순 정렬 (왼쪽이 최신)
  - 참여한 날짜: 흰 배경 + 검정 테두리 + 체크 아이콘
  - 미참여 날짜: 회색 배경 + 회색 테두리
- **상세 뷰**:
  - 2단 레이아웃 (답변 작성 UI와 동일)
  - 좌측: 내가 쓴 일기 (노란 포스트잇)
  - 우측: 받은 답변 (줄글, 하이라이트 표시됨)

### 5. 하이라이트 기능

- 리뷰 단계에서 텍스트 드래그하여 선택
- 선택된 텍스트는 연한 노란색 배경
- 지난 일기에서도 하이라이트 확인 가능

### 6. 데이터베이스 초기화

- 관리자 전용 기능
- 빨간색 "DB 초기화" 버튼
- 모든 세션 데이터 삭제

---

## 🛠 기술 스택

### Frontend

- **React** + **TypeScript**
- **Tailwind CSS v4** (미니멀 스타일)
- **Vite** (빌드 도구)
- **Lucide React** (아이콘)
- **date-fns** (날짜 포맷)
- **sonner** (토스트 알림)

### Backend

- **Supabase Edge Functions** (Deno 런타임)
- **Hono** (웹 프레임워크)
- **Supabase Database** (PostgreSQL)

### 데이터베이스

- **Key-Value 스토어**: `kv_store_1d29bb00` 테이블 사용
- **데이터 구조**:
  - `user:{userId}`: 사용자 정보
  - `session:current`: 현재 활성 세션
  - `session:{sessionId}`: 세션 데이터
  - `diary:{sessionId}:{userId}`: 일기
  - `response:{sessionId}:{userId}`: 답변
  - `review:{sessionId}:{userId}`: 리뷰
  - `matching:exclusions`: 매칭 제외 설정

### 인증

- 커스텀 토큰 기반 인증
- 로컬스토리지 토큰 저장
- `X-User-Token` 헤더로 인증

---

## 📊 데이터 모델

### User

```typescript
{
  userId: string // UUID
  email: string
  name: string
  isAdmin: boolean // conch.of.magic@gmail.com만 true
  createdAt: string
}
```

### Session

```typescript
{
  sessionId: string;
  date: string;        // ISO format
  status: 'waiting' | 'writing' | 'responding' | 'reviewing' | 'completed';
  participants: string[];  // userId[]
  matches: Record<string, string>;  // userId → userId
  startedAt: string | null;
  timeRemaining: number;  // seconds
}
```

### Diary

```typescript
{
  userId: string
  sessionId: string
  content: string
  createdAt: string
}
```

### Response

```typescript
{
  userId: string // 답변 작성자
  sessionId: string
  targetUserId: string // 일기 작성자
  content: string
  createdAt: string
}
```

### Review

```typescript
{
  userId: string
  sessionId: string
  highlights: Array<{
    text: string
    startIdx: number
    endIdx: number
  }>
  comment: string
  createdAt: string
}
```

### MatchingExclusion

```typescript
{
  userId: string;
  excludedUserIds: string[];  // 이 사용자와 매칭되지 않을 사용자들
}
```

---

## 🔔 실시간 업데이트

### 폴링 시스템

- 세션 상태 변경 감지
- 2초마다 서버에 현재 세션 조회
- 상태 변경 시 자동으로 화면 전환

### 타이머 동기화

- 서버에서 `timeRemaining` 값 전달
- 클라이언트에서 카운트다운
- 0이 되면 자동 제출

---

## 🎯 사용자 여정

### 일반 사용자

1. 이메일/이름 입력하여 로그인
2. 대기실에서 대기
3. 세션 시작 → 일기 작성 (타이머)
4. 자동으로 답변 작성 단계 전환 → 매칭된 일기에 답변
5. 자동으로 리뷰 단계 전환 → 받은 답변 리뷰
6. 세션 완료 → 대기실로 복귀
7. 언제든지 "지난 일기" 버튼으로 과거 일기 조회

### 관리자

1. 로그인 (conch.of.magic@gmail.com)
2. 관리자 대기실에서 참여자 확인
3. "매칭 설정" 클릭하여 지인 제외 설정
4. "세션 시작" 클릭
5. 관리 패널에서 단계별로 세션 진행:
   - "일기 작성 시작" (시간 설정)
   - "답변 작성 시작" (시간 설정)
   - "리뷰 시작" (시간 설정)
   - "세션 종료"
6. 필요 시 "DB 초기화"로 모든 데이터 삭제

---

## 🚀 배포 환경

### 환경 변수

- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (서버용)

### API 엔드포인트

모든 API는 `/make-server-1d29bb00` prefix 사용:

- `POST /make-server-1d29bb00/auth/login`
- `GET /make-server-1d29bb00/session/current`
- `POST /make-server-1d29bb00/session/start`
- `POST /make-server-1d29bb00/session/advance`
- `POST /make-server-1d29bb00/diary/submit`
- `POST /make-server-1d29bb00/response/submit`
- `POST /make-server-1d29bb00/review/submit`
- `GET /make-server-1d29bb00/history`
- `POST /make-server-1d29bb00/admin/reset-db`
- 등등...

---

## 📝 특이사항

### 제약사항

- Supabase 기본 KV 테이블만 사용 (마이그레이션 불가)
- 별도 테이블 생성 불가능
- 모든 데이터는 `kv_store_1d29bb00` 테이블에 key-value 형태로 저장

### 보안

- `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용
- 프론트엔드는 `SUPABASE_ANON_KEY`만 사용
- 모든 API 요청은 `X-User-Token` 헤더로 인증
- 관리자 권한은 서버에서 이메일로 검증

### UX 최적화

- 타이머 종료 시 자동 제출로 사용자 불편 최소화
- 새로고침해도 데이터 유지 (`hasLoaded` 플래그)
- 폴링으로 실시간 세션 상태 반영
- 미니멀한 UI로 집중력 향상

---

## 🎨 브랜딩

### 소라의 마법 앱 프로모션

- 대기실에 앱 다운로드 링크 배너
- 로고 이미지 표시
- App Store 링크 연결

---

## 📅 향후 개선 방향

### 고려 사항

1. WebSocket 도입으로 실시간성 강화
2. 푸시 알림 (세션 시작 알림)
3. 더 다양한 매칭 알고리즘
4. 통계 대시보드 (관리자용)
5. 모바일 앱 개발
6. 일기 검색 기능
7. 감정 분석 AI 통합

---

## 📄 라이선스

내부 프로젝트 / 비공개

---

**문서 작성일**: 2026년 1월 28일  
**버전**: 1.0  
**작성자**: AI Assistant
