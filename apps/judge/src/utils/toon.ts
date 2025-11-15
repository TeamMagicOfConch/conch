import { encode, decode } from "@toon-format/toon"
import type { JudgeMessages, RawJudgeModelOutput } from "../types/judge"

/**
 * JudgeMessages를 TOON 형식으로 변환
 */
export function messagesToToon(messages: JudgeMessages): string {
  const data = {
    system: messages.system,
    user: messages.user,
    assistant: messages.assistant,
  }
  return encode(data)
}

/**
 * TOON 형식 문자열을 JSON 객체로 변환
 */
export function toonToJson<T>(toonString: string): T {
  try {
    return decode(toonString) as T
  } catch (error) {
    throw new Error(`Failed to parse TOON format: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * LLM의 TOON 형식 응답을 RawJudgeModelOutput으로 파싱
 */
export function parseJudgeOutput(toonString: string): RawJudgeModelOutput {
  const parsed = toonToJson<RawJudgeModelOutput>(toonString)
  
  // 타입 검증
  if (typeof parsed.score !== "number") {
    throw new Error("Invalid judge output: score must be a number")
  }
  if (parsed.decision !== "acceptable" && parsed.decision !== "unacceptable") {
    throw new Error("Invalid judge output: decision must be 'acceptable' or 'unacceptable'")
  }
  if (typeof parsed.reason !== "string") {
    throw new Error("Invalid judge output: reason must be a string")
  }
  
  return parsed
}

/**
 * TOON 형식 검증
 */
export function isValidToon(toonString: string): boolean {
  try {
    decode(toonString)
    return true
  } catch {
    return false
  }
}

