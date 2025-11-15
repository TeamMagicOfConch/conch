import { Handler } from "@netlify/functions"
import { z } from "zod"
import { evaluateWithLLM } from "../../src/services/llmEvaluator"
import { uploadScoreToLangfuse } from "../../src/services/langfuseService"
import { createErrorResponse, ValidationError } from "../../src/utils/errorHandling"
import { logger } from "../../src/utils/logger"
import type {
  JudgeRequestBody,
  JudgeResponseBody,
  LangfuseUploadStatus,
} from "../../src/types/judge"
import type { LangfuseScorePayload } from "../../src/types/langfuse"

// Request body 검증 스키마
const judgeRequestSchema = z.object({
  traceId: z.string().nullable().optional(),
  messages: z.object({
    system: z.string(),
    user: z.string(),
    assistant: z.string(),
  }),
  metadata: z
    .object({
      model: z.string().optional(),
      taskType: z.string().optional(),
      userId: z.string().optional(),
      timestamp: z.string().optional(),
    })
    .passthrough()
    .optional(),
})

export const handler: Handler = async (event, _context) => {
  // CORS preflight 요청 처리
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    }
  }

  // POST 메서드만 허용
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    // Request body 파싱 및 검증
    let body: JudgeRequestBody
    try {
      const parsed = JSON.parse(event.body || "{}")
      body = judgeRequestSchema.parse(parsed) as JudgeRequestBody
    } catch (error) {
      throw new ValidationError(
        `Invalid request body: ${error instanceof Error ? error.message : String(error)}`
      )
    }

    // LLM 평가 수행
    let judgeScore: number | null = null
    let judgeDecision: JudgeResponseBody["judgeDecision"] = "unknown"
    let judgeReason = ""
    let langfuseScoreUpload: LangfuseUploadStatus = "skipped"

    try {
      const judgeOutput = await evaluateWithLLM(body.messages)
      judgeScore = judgeOutput.score
      judgeDecision = judgeOutput.decision
      judgeReason = judgeOutput.reason

      // traceId가 있으면 Langfuse에 업로드
      if (body.traceId) {
        try {
          const langfusePayload: LangfuseScorePayload = {
            traceId: body.traceId,
            name: "judge.score",
            value: judgeScore,
            metadata: {
              decision: judgeDecision,
              reason: judgeReason,
            },
          }

          await uploadScoreToLangfuse(langfusePayload)
          langfuseScoreUpload = "success"
          logger.info("Score uploaded to Langfuse", {
            traceId: body.traceId,
            score: judgeScore,
          })
        } catch (error) {
          langfuseScoreUpload = "failed"
          logger.error("Failed to upload score to Langfuse", error, {
            traceId: body.traceId,
          })
          // Langfuse 업로드 실패는 전체 요청을 실패시키지 않음
        }
      }
    } catch (error) {
      logger.error("LLM evaluation failed", error)
      // LLM 평가 실패는 응답에 반영되지만 요청 자체는 성공으로 처리
    }

    // 응답 생성
    const response: JudgeResponseBody = {
      judgeScore,
      judgeDecision,
      judgeReason,
      langfuseScoreUpload,
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response),
    }
  } catch (error) {
    return createErrorResponse(error)
  }
}

