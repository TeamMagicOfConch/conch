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

