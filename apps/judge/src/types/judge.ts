export interface JudgeMessages {
  system: string;
  user: string;
  assistant: string;
}

export interface JudgeMetadata {
  model?: string;
  taskType?: string;
  userId?: string;
  timestamp?: string; // ISO-8601
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

