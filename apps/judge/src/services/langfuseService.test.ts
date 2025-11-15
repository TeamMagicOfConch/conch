import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadScoreToLangfuse } from "./langfuseService";
import type { LangfuseScorePayload } from "../types/langfuse";

// 환경 변수 설정
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    OPENAI_API_KEY: "test-openai-key",
    LANGFUSE_PUBLIC_KEY: "test-public-key",
    LANGFUSE_SECRET_KEY: "test-secret-key",
    LANGFUSE_HOST: "https://cloud.langfuse.com",
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// fetch 모킹
global.fetch = vi.fn();

describe("langfuseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upload score to Langfuse successfully", async () => {
    const payload: LangfuseScorePayload = {
      traceId: "test-trace-id",
      name: "judge.score",
      value: 4.2,
      metadata: {
        decision: "acceptable",
        reason: "Test reason",
      },
    };
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);
    
    await expect(uploadScoreToLangfuse(payload)).resolves.not.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should throw error on API failure", async () => {
    const payload: LangfuseScorePayload = {
      traceId: "test-trace-id",
      name: "judge.score",
      value: 4.2,
    };
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "Server error",
    } as Response);
    
    await expect(uploadScoreToLangfuse(payload)).rejects.toThrow();
  });
});

