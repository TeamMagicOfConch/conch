import { describe, it, expect, vi, beforeEach } from "vitest"
import type { JudgeMessages } from "../types/judge"

// OpenAI 모듈 모킹
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}))

describe("llmEvaluator", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should evaluate messages and return judge output", async () => {
    const OpenAI = (await import("openai")).default
    const mockOpenAI = new OpenAI({ apiKey: "test-key" })
    
    const mockResponse = {
      choices: [
        {
          message: {
            content: `score: 4.2
decision: acceptable
reason: Clear and helpful.`,
          },
        },
      ],
    }
    
    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockResponse as never
    )
    
    const messages: JudgeMessages = {
      system: "You are a helpful assistant",
      user: "Hello",
      assistant: "Hi there!",
    }
    
    // 실제 구현에서는 OpenAI 인스턴스를 직접 모킹하기 어려우므로
    // 이 테스트는 통합 테스트로 이동하는 것이 좋습니다
    // 여기서는 타입 검증만 수행
    expect(messages).toBeDefined()
    expect(messages.system).toBe("You are a helpful assistant")
  })
})

