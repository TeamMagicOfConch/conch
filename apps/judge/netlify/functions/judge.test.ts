import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { HandlerEvent, HandlerContext } from "@netlify/functions"
import { handler } from "./judge"

// 환경 변수 설정
const originalEnv = process.env

beforeEach(() => {
  process.env = {
    ...originalEnv,
    OPENAI_API_KEY: "test-openai-key",
    LANGFUSE_PUBLIC_KEY: "test-public-key",
    LANGFUSE_SECRET_KEY: "test-secret-key",
    LANGFUSE_HOST: "https://cloud.langfuse.com",
  }
})

afterEach(() => {
  process.env = originalEnv
  vi.clearAllMocks()
})

const createMockEvent = (body: unknown, method = "POST"): HandlerEvent => ({
  httpMethod: method,
  path: "/judge",
  pathParameters: null,
  queryStringParameters: null,
  headers: {},
  multiValueHeaders: {},
  body: typeof body === "string" ? body : JSON.stringify(body),
  isBase64Encoded: false,
  requestContext: {
    requestId: "test-request-id",
    identity: {
      sourceIp: "127.0.0.1",
    },
    httpMethod: method,
    requestTime: "01/Jan/2024:00:00:00 +0000",
    requestTimeEpoch: 0,
    path: "/judge",
    accountId: "",
    apiId: "",
    protocol: "HTTP/1.1",
    resourceId: "",
    resourcePath: "/judge",
    stage: "",
  },
})

const createMockContext = (): HandlerContext => ({
  callbackWaitsForEmptyEventLoop: false,
  functionName: "judge",
  functionVersion: "$LATEST",
  invokedFunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:judge",
  memoryLimitInMB: "128",
  awsRequestId: "test-request-id",
  logGroupName: "/aws/lambda/judge",
  logStreamName: "2024/01/01/[$LATEST]test",
  getRemainingTimeInMillis: () => 30000,
  done: vi.fn(),
  fail: vi.fn(),
  succeed: vi.fn(),
})

describe("judge function", () => {
  it("should handle OPTIONS request", async () => {
    const event = createMockEvent({}, "OPTIONS")
    const context = createMockContext()

    const result = await handler(event, context)

    expect(result?.statusCode).toBe(200)
    expect(result?.headers?.["Access-Control-Allow-Origin"]).toBe("*")
  })

  it("should reject non-POST methods", async () => {
    const event = createMockEvent({}, "GET")
    const context = createMockContext()

    const result = await handler(event, context)

    expect(result?.statusCode).toBe(405)
  })

  it("should validate request body", async () => {
    const event = createMockEvent({ invalid: "data" })
    const context = createMockContext()

    const result = await handler(event, context)

    expect(result?.statusCode).toBe(400)
  })

  it("should return CORS headers", async () => {
    const event = createMockEvent({
      messages: {
        system: "Test",
        user: "Test",
        assistant: "Test",
      },
    })
    const context = createMockContext()

    const result = await handler(event, context)

    expect(result?.headers?.["Access-Control-Allow-Origin"]).toBe("*")
    expect(result?.headers?.["Content-Type"]).toBe("application/json")
  })
})

