# LLM-as-Judge Evaluation Server — PRD  
**Goal:**  
사용자 입력/출력을 외부 SaaS(Langfuse)에 업로드하지 않고, 내부 서버에서만 LLM-as-judge 평가를 수행한 후 **score만 Langfuse로 전송**하는 **Netlify Functions + TypeScript** 기반 평가 서버 구축.

---

# 1. 🎯 Product Purpose

우리의 LLM 서비스 품질을 자동화하려면 자동 평가(LLM-as-judge)가 필요하다.  
하지만 사용자 입력(system/user/assistant 역할 포함)은 **보안 및 개인정보 보호 문제로 인해 Langfuse에 저장할 수 없다.**

이 서버는 다음을 수행한다:

- LLM에게 **system, user, assistant 메시지를 모두 전달**하여 평가 수행
- LLM이 생성한 평가점수(score), 판단(decision), 사유(reason)을 내부에서만 처리
- Langfuse에는 **원문 없이 score만 업로드**
- 모든 서버 코드는 **TypeScript**로 작성하고, strict 타입 검증을 통과해야 한다.

---

# 2. 🏗️ Architecture Overview

```
Caller (Dify / Backend / Agent)
        │
        ▼
[Judge API Server: Netlify Functions (TypeScript)]
        │
  ┌─────┴──────────────────────┐
  │ 1) LLM-as-Judge Execution   │
  │    (TOON 형식 입출력)        │
  │ 2) score/decision/reason    │
  └─────┬───────────────────────┘
        ▼
[Langfuse Score API]
  (Score only, no raw text)
```

---

# 3. 🛠 Functional Requirements

## 3.1 API Endpoint

### **POST /judge**

외부 서비스(Dify 등)가 평가 요청 시 호출한다.

### Request Body (Logical Schema)

```ts
interface JudgeMessages {
  system: string;
  user: string;
  assistant: string;
}

interface JudgeMetadata {
  model?: string;
  taskType?: string;
  userId?: string;
  timestamp?: string; // ISO-8601
  [key: string]: unknown;
}

interface JudgeRequestBody {
  traceId?: string | null;
  messages: JudgeMessages;
  metadata?: JudgeMetadata;
}
```

TypeScript 상에서 Request Body는 위 인터페이스를 기준으로 검증/파싱한다.

### Response Body (Logical Schema)

```ts
type LangfuseUploadStatus = "success" | "failed" | "skipped";

interface JudgeResponseBody {
  judgeScore: number | null;
  judgeDecision: "acceptable" | "unacceptable" | "unknown";
  judgeReason: string;
  langfuseScoreUpload: LangfuseUploadStatus;
}
```

HTTP 응답은 반드시 `JudgeResponseBody` 형태의 JSON이어야 한다.

**참고:** API 요청/응답은 JSON 형식을 유지하며, LLM과의 통신에서만 TOON(Token-Oriented Object Notation) 형식을 사용하여 토큰 효율성을 높인다.

---

# 4. 🧠 LLM-as-Judge Prompt Definition

## 4.1 LLM 호출 메시지 구조  
(역할 기반: system / user / assistant 명확히 분리)

```json
[
  {
    "role": "system",
    "content": "You are an expert evaluator LLM. Evaluate the quality, correctness, and safety of an assistant's response."
  },
  {
    "role": "user",
    "content": "Below is a conversation. Evaluate the assistant's output.\n\nSystem Instruction:\n{{system}}\n\nUser Input:\n{{user}}\n\nAssistant Output:\n{{assistant}}\n"
  }
]
```

### 4.2 LLM에게 요구하는 출력(TOON 형식)

LLM은 TOON(Token-Oriented Object Notation) 형식으로 응답해야 한다. TOON 형식은 JSON보다 토큰 효율성이 높아 LLM 비용을 절감할 수 있다.

**TOON 형식 예시:**

```
judge{score,decision,reason}:
  4.2,acceptable,Clear and helpful.
```

**JSON 형식 (참고용):**

```json
{
  "score": 4.2,
  "decision": "acceptable",
  "reason": "Clear and helpful."
}
```

서버는 LLM의 TOON 형식 응답을 파싱하여 JSON 객체로 변환한 후 사용한다.

### 4.3 TypeScript 상의 LLM 결과 타입

```ts
type JudgeDecision = "acceptable" | "unacceptable";

interface RawJudgeModelOutput {
  score: number;
  decision: JudgeDecision;
  reason: string;
}
```

LLM 응답은 TOON 형식 문자열이어야 하며, 서버는 다음 과정을 거쳐 처리한다:
1. LLM의 TOON 형식 응답을 받음
2. `@toon-format/toon` 패키지의 `decode()` 함수를 사용하여 TOON → JSON 변환
3. 변환된 JSON 객체를 `RawJudgeModelOutput` 타입으로 검증
4. 검증된 객체를 사용하여 평가 결과 생성

### 4.4 평가 기준

- **정확성 (Correctness)**
- **유용성 (Helpfulness)**
- **맥락 적합성 (Relevance)**
- **안전성 (Safety)**

---

# 5. 📡 Langfuse Score Upload

Langfuse에는 다음 필드만 전송한다:

### 5.1 Logical Schema

```ts
interface LangfuseScorePayload {
  traceId: string;
  name: "judge.score";
  value: number;
  metadata?: {
    decision: JudgeDecision;
    reason: string;
    [key: string]: unknown;
  };
}
```

### 5.2 예시 Payload

```json
{
  "traceId": "trace_id_value",
  "name": "judge.score",
  "value": 4.5,
  "metadata": {
    "decision": "acceptable",
    "reason": "The response is safe and correct."
  }
}
```

### 5.3 ❌ 절대 Langfuse에 포함되면 안 되는 정보

- system prompt 원문  
- user prompt 원문  
- assistant 응답 원문  
- 민감 데이터(PII, 고유 비즈니스 정보 등)

---

# 6. 🧱 Non-functional Requirements

## 6.1 보안

- 모든 통신은 HTTPS 사용
- 로그에는 system/user/assistant 콘텐츠 기록 금지
- Langfuse / OpenAI API keys는 **환경 변수**로만 관리
- CI 테스트 중에도 raw prompt 업로드 금지
- TypeScript 타입 정보(예: 인터페이스 정의)는 로그에 포함 가능하지만, 실제 문자열 payload는 포함하지 않는다.

## 6.2 성능

- 평균 응답 시간 목표: 2–5초
- 초당 20 요청 처리 스케일링 가능해야 함
- LLM 호출/ Langfuse 호출은 비동기(non-blocking) 방식으로 구현

## 6.3 장애 처리

- LLM 호출 실패 → `judgeScore = null`, `judgeDecision = "unknown"`, `langfuseScoreUpload = "skipped"`
- Langfuse 업로드 실패 → `langfuseScoreUpload = "failed"` 및 (옵션) retry queue 저장

---

# 7. 📦 Internal Modules (TypeScript 기준)

프로젝트는 TypeScript를 기본 언어로 사용한다.

## 7.1 프로젝트 구조 (Netlify Functions)

```txt
apps/judge/
  netlify/
    functions/
      judge.ts            # Netlify Function 핸들러 (POST /judge)
  src/
    config/
      env.ts              # 환경 변수 검증 및 로드
    services/
      llmEvaluator.ts     # LLM 호출 및 평가 수행 (TOON 입출력)
      langfuseService.ts  # Langfuse API 클라이언트
    types/
      judge.ts           # Judge 관련 타입 정의
      langfuse.ts        # Langfuse 관련 타입 정의
    utils/
      toon.ts            # TOON 형식 변환 유틸리티
      logger.ts          # 안전한 로깅 (원문 제외)
      errorHandling.ts   # 에러 처리 유틸리티
```

빌드 결과물은 `netlify/functions` 디렉토리에 생성되며, Netlify Functions로 배포된다.

## 7.2 주요 TypeScript 모듈 요구사항

### `types/judge.ts`

```ts
export interface JudgeMessages {
  system: string;
  user: string;
  assistant: string;
}

export interface JudgeMetadata {
  model?: string;
  taskType?: string;
  userId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface JudgeRequestBody {
  traceId?: string | null;
  messages: JudgeMessages;
  metadata?: JudgeMetadata;
}

export type LangfuseUploadStatus = "success" | "failed" | "skipped";

export type JudgeDecision = "acceptable" | "unacceptable" | "unknown";

export interface RawJudgeModelOutput {
  score: number;
  decision: Exclude<JudgeDecision, "unknown">;
  reason: string;
}

export interface JudgeResponseBody {
  judgeScore: number | null;
  judgeDecision: JudgeDecision;
  judgeReason: string;
  langfuseScoreUpload: LangfuseUploadStatus;
}
```

### `types/langfuse.ts`

```ts
import type { JudgeDecision } from "./judge";

export interface LangfuseScorePayload {
  traceId: string;
  name: "judge.score";
  value: number;
  metadata?: {
    decision: JudgeDecision;
    reason: string;
    [key: string]: unknown;
  };
}
```

---

# 8. 🌐 API Layer Specification (Netlify Functions + TypeScript)

## 8.1 Netlify Function 핸들러 시그니처

```ts
// netlify/functions/judge.ts
import { Handler } from "@netlify/functions";
import { JudgeRequestBody, JudgeResponseBody } from "../src/types/judge";

export const handler: Handler = async (event, context) => {
  // POST 메서드만 허용
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Request body 검증 및 파싱
  const body: JudgeRequestBody = JSON.parse(event.body || "{}");
  
  // LLM 평가 수행 (내부적으로 TOON 형식 사용)
  // ...
  
  // JudgeResponseBody 반환
  const response: JudgeResponseBody = {
    judgeScore: 4.2,
    judgeDecision: "acceptable",
    judgeReason: "Clear and helpful.",
    langfuseScoreUpload: "success",
  };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(response),
  };
};
```

- `event.body`는 `JudgeRequestBody`로 타입 지정 및 검증
- 응답은 `JudgeResponseBody`를 만족해야 함
- CORS 헤더 설정 필요

---

# 9. 🔁 End-to-End Flow

```
Caller → POST /judge (JudgeRequestBody - JSON)
             ↓
  Validate & parse body (TypeScript types)
             ↓
  Build evaluation messages (system/user/assistant)
             ↓
  Convert messages to TOON format
             ↓
         Call LLM (evaluate with TOON input)
             ↓
  Parse TOON response → JSON → RawJudgeModelOutput
             ↓
If traceId exists:
    Build LangfuseScorePayload
    Upload score → Langfuse
Else:
    Skip upload
             ↓
Build JudgeResponseBody (JSON)
             ↓
Return JSON result to caller
```

---

# 10. 🧪 Test Cases (TypeScript 관점 포함)

### TC01 — 정상 평가

- 입력: system/user/assistant 정상 문자열
- 기대:
  - `judgeScore > 0`
  - `judgeDecision` in {`"acceptable"`, `"unacceptable"`}
  - `langfuseScoreUpload = "success"`
  - 타입: `JudgeResponseBody` 만족

### TC02 — traceId 없음

- 입력: `traceId` 생략 또는 `null`
- 기대:
  - Langfuse 호출 생략
  - `langfuseScoreUpload = "skipped"`

### TC03 — LLM TOON 파싱 실패

- LLM 응답이 유효한 TOON 형식이 아닐 때
- 기대:
  - 내부 재시도 1회까지 수행
  - 최종 실패 시:
    - `judgeScore = null`
    - `judgeDecision = "unknown"`
    - `langfuseScoreUpload = "skipped"`

### TC04 — Langfuse API 오류

- Langfuse 서버 오류/네트워크 에러 발생
- 기대:
  - `judgeScore`는 LLM 결과 그대로
  - `langfuseScoreUpload = "failed"`
  - (옵션) retry queue에 `LangfuseScorePayload` 저장

### TC05 — TypeScript 타입 검증

- 잘못된 Request Body(예: messages 누락, 타입 불일치)
- 기대:
  - 런타임에서 400 Bad Request 반환
  - 빌드 시에는 `JudgeRequestBody` 인터페이스를 기준으로 타입 오류를 조기에 발견

---

# 11. ✔ Summary for LLM (Implementation Notes)

- 서버 언어는 **TypeScript**이며 `strict` 모드 활성화
- 배포 방식: **Netlify Functions** (서버리스)
- system/user/assistant 3개 메시지를 모두 받아 평가해야 함
- 평가 프롬프트는 role 기반 구조 유지
- **LLM 입출력은 TOON 형식 사용** (토큰 효율성 향상)
  - 입력: system/user/assistant 메시지를 TOON 형식으로 변환하여 프롬프트에 포함
  - 출력: LLM은 TOON 형식으로 응답, 서버는 TOON → JSON 변환 후 처리
- API 요청/응답은 JSON 형식 유지
- Langfuse에는 **score만** 업로드 (`LangfuseScorePayload`)
- 로그에 절대 원문(system/user/assistant)을 저장하지 말 것
- 실패 시 명시적인 fallback 전략을 따를 것

---

# 12. Appendix — Example Request & Result

## 12.1 Example Request (JSON)

```json
{
  "traceId": "trc_abc123",
  "messages": {
    "system": "Follow security guidelines.",
    "user": "How do I reset my account?",
    "assistant": "Go to settings and click the reset password button."
  },
  "metadata": {
    "model": "gpt-4.1-mini",
    "taskType": "chat",
    "userId": "user-001",
    "timestamp": "2025-02-22T10:00:00Z"
  }
}
```

## 12.2 LLM 평가 결과(TOON 형식)

**TOON 형식 (실제 LLM 응답):**

```
judge{score,decision,reason}:
  4.2,acceptable,Clear and helpful.
```

**JSON 형식 (서버 내부 변환 후):**

```json
{
  "score": 4.2,
  "decision": "acceptable",
  "reason": "Clear and helpful."
}
```

## 12.3 Langfuse 업로드 Payload

```json
{
  "traceId": "trc_abc123",
  "name": "judge.score",
  "value": 4.2,
  "metadata": {
    "decision": "acceptable",
    "reason": "Clear and helpful."
  }
}
```

## 12.4 최종 API Response (`JudgeResponseBody`)

```json
{
  "judgeScore": 4.2,
  "judgeDecision": "acceptable",
  "judgeReason": "Clear and helpful.",
  "langfuseScoreUpload": "success"
}
```
