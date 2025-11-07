import { Api as ConchApi, SaveReq, ResponseListInquiryMonthRes, ResponseInquiryDayRes, CursorBaseReviewRes } from './types/conchApi'
import { submitReviewSSE, type SubmitReviewSSEOptions } from './sse'
import type { StorageLike } from './auth'

export type ConchReviewDeps = {
  swaggerClient: InstanceType<typeof ConchApi>
  storage?: StorageLike
  accessTokenKey?: string
  // auth helpers를 연결하면 SSE에서 자동 재시도 가능
  login?: () => Promise<any>
  refreshToken?: () => Promise<any>
}

export type ConchReviewHelpers = {
  list: (args?: { after?: string }) => Promise<CursorBaseReviewRes | undefined>
  save: (review: SaveReq) => Promise<any>
  inquiryMonth: (args: { year: number; month: number }) => Promise<ResponseListInquiryMonthRes['data']>
  inquiryDate: (args: { year: number; month: number; day: number }) => Promise<ResponseInquiryDayRes['data']>
  testSecurity: () => Promise<any>
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
  const axiosInstance = deps.swaggerClient.instance
  const baseURL = (axiosInstance.defaults.baseURL || '') as string
  const accessTokenKey = deps.accessTokenKey || 'CONCH_ACCESS_TOKEN'

  async function list(args?: { after?: string }): Promise<CursorBaseReviewRes | undefined> {
    const res = await deps.swaggerClient.reviewController.list(
      args?.after ? { after: args.after } : undefined,
    )
    return res.data.data
  }

  async function save(review: SaveReq) {
    const res = await deps.swaggerClient.reviewController.saveReview(review)
    return res.data as any
  }

  async function inquiryMonth(args: { year: number; month: number }): Promise<ResponseListInquiryMonthRes['data']> {
    const res = await deps.swaggerClient.reviewController.inquiryMonth({ year: args.year, month: args.month })
    return res.data.data
  }

  async function inquiryDate(args: { year: number; month: number; day: number }): Promise<ResponseInquiryDayRes['data']> {
    const res = await deps.swaggerClient.reviewController.inquiryDate({
      year: args.year,
      month: args.month,
      day: args.day,
    })
    return res.data.data
  }

  async function testSecurity() {
    const res = await deps.swaggerClient.reviewController.testSecurity()
    return res.data as any
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
    return submitReviewSSE({
      baseURL,
      path: opts.path,
      review: opts.review,
      onChunk: opts.onChunk,
      onError: opts.onError,
      onDone: opts.onDone,
      fetchImpl: opts.fetchImpl,
      getAccessToken: resolveAccessToken,
      // auth 연동(선택)
      refreshToken: deps.refreshToken ? async () => {
        const fn = deps.refreshToken!
        const res = await fn()
        return (res as any)?.data?.accessToken ?? null
      } : undefined,
      login: deps.login ? async () => {
        const fn = deps.login!
        const res = await fn()
        return (res as any)?.data?.accessToken ?? null
      } : undefined,
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


