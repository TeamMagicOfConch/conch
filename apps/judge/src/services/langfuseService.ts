import { getConfig } from "../config/env"
import type { LangfuseScorePayload } from "../types/langfuse"

const LANGFUSE_API_PATH = "/api/public/scores"

/**
 * Langfuse에 score 업로드
 */
export async function uploadScoreToLangfuse(
  payload: LangfuseScorePayload
): Promise<void> {
  const config = getConfig()
  const url = `${config.langfuse.host}${LANGFUSE_API_PATH}`
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${Buffer.from(
        `${config.langfuse.publicKey}:${config.langfuse.secretKey}`
      ).toString("base64")}`,
    },
    body: JSON.stringify(payload),
  })
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(
      `Langfuse API error: ${response.status} ${response.statusText} - ${errorText}`
    )
  }
}

