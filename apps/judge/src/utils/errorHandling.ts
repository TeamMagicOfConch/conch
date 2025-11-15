import { logger } from "./logger";

export interface ErrorResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * 에러를 HTTP 응답으로 변환
 */
export function createErrorResponse(
  error: Error | unknown,
  defaultStatusCode = 500
): ErrorResponse {
  const statusCode = error instanceof Error && "statusCode" in error
    ? (error.statusCode as number)
    : defaultStatusCode;

  const message = error instanceof Error ? error.message : String(error);

  // 원문은 로그에 포함하지 않음
  logger.error("Request failed", error, { statusCode });

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error: message,
      statusCode,
    }),
  };
}

/**
 * Validation 에러 생성
 */
export class ValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * LLM 평가 실패 에러
 */
export class LLMEvaluationError extends Error {
  statusCode = 500;

  constructor(message: string) {
    super(message);
    this.name = "LLMEvaluationError";
  }
}

/**
 * Langfuse 업로드 실패 에러
 */
export class LangfuseUploadError extends Error {
  statusCode = 500;

  constructor(message: string) {
    super(message);
    this.name = "LangfuseUploadError";
  }
}

