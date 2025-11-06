import type { SaveReq } from './types/conchApi'

const CHUNK_REGEX = /{(.*)}/g
const KO_TIME_OFFSET = 9 * 60 * 60 * 1000 // 9시간

type FetchLikeResponse = { body?: any; status: number }
type FetchLike = (url: string, init?: any) => Promise<FetchLikeResponse>

export type SubmitReviewSSEOptions = {
  baseURL: string
  path?: string // default: '/auth/user/api/review/submit'
  review: Pick<SaveReq, 'body' | 'type'> & { reviewDate?: string }
  onChunk: (text: string) => void
  onError?: (error: Error) => void
  onDone?: () => void
  fetchImpl?: FetchLike
  // 토큰 전략: 우선순위 token → getAccessToken → undefined
  token?: string | null
  getAccessToken?: () => Promise<string | null>
  // 401 처리: refreshToken → login 순으로 재시도
  refreshToken?: () => Promise<string | null>
  login?: () => Promise<string | null>
}

function buildReviewDate(date?: string): string {
  if (date) return date
  return new Date(new Date().getTime() + KO_TIME_OFFSET).toISOString().split('T')[0]
}

async function resolveInitialToken(opts: SubmitReviewSSEOptions): Promise<string | null> {
  if (opts.token) return opts.token
  if (opts.getAccessToken) return opts.getAccessToken()
  return null
}

async function tryRefetchWith(
  fetchFn: FetchLike,
  url: string,
  option: any,
  getToken: (() => Promise<string | null>) | undefined,
) {
  if (!getToken) return null
  const nextToken = await getToken()
  if (!nextToken) return null
  const nextHeaders = { ...option.headers, Authorization: `Bearer ${nextToken}` }
  return fetchFn(url, { ...option, headers: nextHeaders })
}

export async function submitReviewSSE(opts: SubmitReviewSSEOptions): Promise<void> {
  const fetchFn: FetchLike = opts.fetchImpl ?? (globalThis.fetch as any)
  const path = opts.path ?? '/stream/review'
  const url = `${opts.baseURL}${path}`

  const initialToken = await resolveInitialToken(opts)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (initialToken) headers.Authorization = `Bearer ${initialToken}`

  const body: SaveReq = {
    body: opts.review.body,
    type: opts.review.type,
    reviewDate: buildReviewDate(opts.review.reviewDate),
  }

  const option: any = {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }

  try {
    // 1차 요청
    const first = await fetchFn(url, option)

    // 401 → refreshToken 재시도
    const second =
      first.status === 401
        ? await tryRefetchWith(fetchFn, url, option, opts.refreshToken)
        : first

    // 401 → login 재시도
    const finalRes =
      (second && second.status === 401)
        ? await tryRefetchWith(fetchFn, url, option, opts.login)
        : second

    const res = finalRes ?? first

    const reader = res.body?.getReader?.()
    const decoder = new TextDecoder('utf8')

    while (reader) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const matches = [...chunk.matchAll(CHUNK_REGEX)]
      matches.forEach((match) => {
        if (match && match[0]) {
          try {
            const parsed = JSON.parse(match[0])
            if (parsed && typeof parsed.value === 'string') {
              opts.onChunk(parsed.value)
            }
          } catch (e) {
            // 개별 조각 파싱 실패는 무시하고 계속 진행
          }
        }
      })
    }
    if (opts.onDone) opts.onDone()
  } catch (e) {
    if (opts.onError && e instanceof Error) opts.onError(e)
    else if (opts.onError) opts.onError(new Error('Unknown SSE error'))
    throw e
  }
}


