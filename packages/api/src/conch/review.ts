import { Api as ConchApi, SaveReq, ResponseListInquiryMonthRes, ResponseInquiryDayRes, CursorBaseReviewRes } from './types/conchApi'
import type { HttpResponse } from './types/conchApi'
import { submitReviewSSE, type SubmitReviewSSEOptions } from './sse'
import type { StorageLike } from './auth'

export type ConchReviewDeps = {
  swaggerClient: InstanceType<typeof ConchApi>
  storage?: StorageLike
  accessTokenKey?: string
  // auth helpers를 연결하면 SSE에서 자동 재시도 가능
  login?: () => Promise<unknown>
  refreshToken?: () => Promise<unknown>
}

export type ConchReviewHelpers = {
  list: (args?: { after?: string }) => Promise<CursorBaseReviewRes | undefined>
  save: (review: SaveReq) => Promise<unknown>
  inquiryMonth: (args: { year: number; month: number }) => Promise<ResponseListInquiryMonthRes['data']>
  inquiryDate: (args: { year: number; month: number; day: number }) => Promise<ResponseInquiryDayRes['data']>
  testSecurity: () => Promise<unknown>
  submitStreaming: (
    opts: Omit<SubmitReviewSSEOptions, 'baseURL' | 'token' | 'getAccessToken' | 'refreshToken' | 'login' | 'path'> & {
      path?: string
      getAccessToken?: () => Promise<string | null>
    },
  ) => Promise<void>
}

async function maybeAsync<T>(value: T | Promise<T>): Promise<T> {
  return value instanceof Promise ? value : value
}

async function getStored(storage: StorageLike | undefined, key: string): Promise<string | null> {
  if (!storage) return null
  return maybeAsync(storage.getItem(key))
}

export function createConchReviewHelpers(deps: ConchReviewDeps): ConchReviewHelpers {
  const baseURL = deps.swaggerClient.baseUrl || ''
  const accessTokenKey = deps.accessTokenKey || 'magicOfConchAccessToken'

  const getStatus = (error: unknown): number | null => {
    if (!error || typeof error !== 'object') return null
    const record = error as Partial<HttpResponse<unknown>>
    return typeof record.status === 'number' ? record.status : null
  }

  const extractAccessToken = (result: unknown): string | null => {
    if (!result || typeof result !== 'object') return null
    const response = result as { data?: { data?: { accessToken?: string } } }
    return response.data?.data?.accessToken ?? null
  }

  const refreshOrLogin = async (): Promise<string | null> => {
    if (deps.refreshToken) {
      const refreshed = await deps.refreshToken()
      const refreshedToken = extractAccessToken(refreshed)
      if (refreshedToken) return refreshedToken
    }

    if (deps.login) {
      const loggedIn = await deps.login()
      return extractAccessToken(loggedIn)
    }

    return null
  }

  const executeGetWithRetry = async <T>(request: () => Promise<HttpResponse<T>>): Promise<HttpResponse<T>> => {
    try {
      return await request()
    } catch (error) {
      const status = getStatus(error)
      if (status !== 401) throw error

      const token = await refreshOrLogin()
      if (!token) throw error
      deps.swaggerClient.setSecurityData(token)
      return request()
    }
  }

  async function list(args?: { after?: string }): Promise<CursorBaseReviewRes | undefined> {
    const res = await executeGetWithRetry(() => deps.swaggerClient.reviewController.list(args?.after ? { after: args.after } : undefined))
    return res.data.data
  }

  async function save(review: SaveReq) {
    const res = await deps.swaggerClient.reviewController.saveReview(review)
    return res.data
  }

  async function inquiryMonth(args: { year: number; month: number }): Promise<ResponseListInquiryMonthRes['data']> {
    const res = await executeGetWithRetry(() => deps.swaggerClient.reviewController.inquiryMonth({ year: args.year, month: args.month }))
    return res.data.data
  }

  async function inquiryDate(args: { year: number; month: number; day: number }): Promise<ResponseInquiryDayRes['data']> {
    const res = await executeGetWithRetry(() => deps.swaggerClient.reviewController.inquiryDate({ year: args.year, month: args.month, day: args.day }))
    return res.data.data
  }

  async function testSecurity() {
    const res = await executeGetWithRetry(() => deps.swaggerClient.authController.okok())
    return res.data
  }

  async function submitStreaming(
    opts: Omit<SubmitReviewSSEOptions, 'baseURL' | 'token' | 'getAccessToken' | 'refreshToken' | 'login' | 'path'> & {
      path?: string
      getAccessToken?: () => Promise<string | null>
    },
  ): Promise<void> {
    const resolveAccessToken = async () => {
      if (opts.getAccessToken) return opts.getAccessToken()
      return getStored(deps.storage, accessTokenKey)
    }

    let resolveRefreshToken: (() => Promise<string | null>) | undefined
    if (deps.refreshToken) {
      resolveRefreshToken = async () => {
        const res = await deps.refreshToken!()
        return extractAccessToken(res)
      }
    }

    let resolveLoginToken: (() => Promise<string | null>) | undefined
    if (deps.login) {
      resolveLoginToken = async () => {
        const res = await deps.login!()
        return extractAccessToken(res)
      }
    }

    return submitReviewSSE({
      baseURL,
      path: opts.path,
      review: opts.review,
      onChunk: opts.onChunk,
      onError: opts.onError,
      onDone: opts.onDone,
      fetchImpl: opts.fetchImpl,
      getAccessToken: resolveAccessToken,
      refreshToken: resolveRefreshToken,
      login: resolveLoginToken,
    })
  }

  return {
    list,
    save,
    inquiryMonth,
    inquiryDate,
    testSecurity,
    submitStreaming,
  }
}
