import { describe, it, expect } from "vitest"
import { messagesToToon, toonToJson, parseJudgeOutput, isValidToon } from "./toon"
import type { JudgeMessages, RawJudgeModelOutput } from "../types/judge"

describe("toon utils", () => {
  describe("messagesToToon", () => {
    it("should convert JudgeMessages to TOON format", () => {
      const messages: JudgeMessages = {
        system: "You are a helpful assistant",
        user: "Hello",
        assistant: "Hi there!",
      }
      
      const toon = messagesToToon(messages)
      expect(typeof toon).toBe("string")
      expect(toon.length).toBeGreaterThan(0)
    })
  })

  describe("toonToJson", () => {
    it("should convert TOON format to JSON", () => {
      const toonString = `score: 4.2
decision: acceptable
reason: Clear and helpful.`
      
      const result = toonToJson<RawJudgeModelOutput>(toonString)
      expect(result.score).toBe(4.2)
      expect(result.decision).toBe("acceptable")
      expect(result.reason).toBe("Clear and helpful.")
    })

    it("should handle empty string", () => {
      // TOON 라이브러리는 빈 문자열을 빈 객체로 파싱함
      const emptyToon = ""
      const result = toonToJson<Record<string, unknown>>(emptyToon)
      expect(result).toEqual({})
    })
  })

  describe("parseJudgeOutput", () => {
    it("should parse valid judge output", () => {
      const toonString = `score: 4.5
decision: acceptable
reason: Good response.`
      
      const result = parseJudgeOutput(toonString)
      expect(result.score).toBe(4.5)
      expect(result.decision).toBe("acceptable")
      expect(result.reason).toBe("Good response.")
    })

    it("should throw error for invalid score type", () => {
      const invalidToon = `score: invalid
decision: acceptable
reason: Test.`
      expect(() => parseJudgeOutput(invalidToon)).toThrow()
    })

    it("should throw error for invalid decision", () => {
      const invalidToon = `score: 4.0
decision: invalid
reason: Test.`
      expect(() => parseJudgeOutput(invalidToon)).toThrow()
    })
  })

  describe("isValidToon", () => {
    it("should return true for valid TOON format", () => {
      const validToon = `score: 4.2
decision: acceptable
reason: Test.`
      expect(isValidToon(validToon)).toBe(true)
    })

    it("should return true for empty string (TOON library is lenient)", () => {
      // TOON 라이브러리는 빈 문자열도 유효한 TOON으로 간주함
      const emptyToon = ""
      expect(isValidToon(emptyToon)).toBe(true)
    })
  })
})

