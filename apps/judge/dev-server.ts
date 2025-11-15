import "dotenv/config"
import express from "express"
import type { Request, Response } from "express"
import type { HandlerEvent, HandlerContext } from "@netlify/functions"
import { handler } from "./netlify/functions/judge.js"

const app = express()
const PORT = process.env.PORT || 8888

// JSON body parser middleware
app.use(express.json())

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type")
  next()
})

/**
 * Express Request를 Netlify Functions HandlerEvent로 변환
 */
function createHandlerEvent(req: Request): HandlerEvent {
  return {
    httpMethod: req.method,
    path: req.path,
    rawUrl: req.url,
    rawQuery: req.url.split("?")[1] || "",
    queryStringParameters: req.query && Object.keys(req.query).length > 0 ? (req.query as Record<string, string>) : null,
    multiValueQueryStringParameters: null,
    headers: req.headers as Record<string, string>,
    multiValueHeaders: {},
    body: req.method === "POST" || req.method === "PUT" || req.method === "PATCH" ? JSON.stringify(req.body) : null,
    isBase64Encoded: false,
  }
}

/**
 * Netlify Functions HandlerContext 생성
 */
function createHandlerContext(): HandlerContext {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "judge-dev",
    functionVersion: "$LATEST",
    invokedFunctionArn: "local-dev",
    memoryLimitInMB: "128",
    awsRequestId: `local-${Date.now()}`,
    logGroupName: "/local/judge",
    logStreamName: "local",
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  }
}

/**
 * Netlify Functions 응답을 Express Response로 변환
 */
async function handleNetlifyResponse(netlifyResponse: { statusCode: number; headers?: Record<string, string>; body?: string } | null, res: Response): Promise<void> {
  if (!netlifyResponse) {
    res.status(500).json({ error: "Internal server error" })
    return
  }

  // 상태 코드 설정
  res.status(netlifyResponse.statusCode)

  // 헤더 설정
  if (netlifyResponse.headers) {
    Object.entries(netlifyResponse.headers).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
  }

  // 본문 설정
  if (netlifyResponse.body) {
    const contentType = netlifyResponse.headers?.["Content-Type"] || "application/json"
    if (contentType.includes("application/json")) {
      try {
        res.json(JSON.parse(netlifyResponse.body))
      } catch {
        res.send(netlifyResponse.body)
      }
    } else {
      res.send(netlifyResponse.body)
    }
  } else {
    res.end()
  }
}

// Judge 엔드포인트
app.all("/judge", async (req: Request, res: Response) => {
  try {
    const event = createHandlerEvent(req)
    const context = createHandlerContext()
    const result = await handler(event, context)
    await handleNetlifyResponse(result, res)
  } catch (error) {
    console.error("Error handling request:", error)
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Judge dev server running on http://localhost:${PORT}`)
  console.log(`📝 Judge endpoint: http://localhost:${PORT}/judge`)
  console.log(`❤️  Health check: http://localhost:${PORT}/health`)
})

