import type { HttpResponse } from './types/conchApi'
import { Api as ConchApi, RegisterReq, ResponseAuthRes, StreakReq } from './types/conchApi'
import { decodeJwtPayload } from './util'
import { SEMI_USER_ROLE, NEED_MORE_ONBOARDING_CODE } from './consts'

export { UNREGISTERED_CODE, REFRESH_TOKEN_EXPIRED_CODE, SEMI_USER_ROLE, NEED_MORE_ONBOARDING_CODE } from './consts'

const OS_ID_DEBUG = '260116-test-1'

export type StorageLike = {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
}

export type GetDeviceId = () => Promise<string>
export type GetPlatformOS = () => string

export type TokenBundle = {
  accessToken: string | null | undefined
  refreshToken: string | null | undefined
  username?: string | null | undefined
}

export type ConchAuthDeps = {
  storage: StorageLike
  swaggerClient: InstanceType<typeof ConchApi>
  getDeviceId?: GetDeviceId
  getPlatformOS?: GetPlatformOS
  accessTokenKey?: string
  refreshTokenKey?: string
  usernameKey?: string
}

type ApiHttpError = Partial<HttpResponse<unknown, unknown>> & {
  status?: number
  error?: unknown
  data?: unknown
}

export type ConchAuthHelpers = {
  setTokens: (tokens: TokenBundle) => Promise<boolean>
  login: () => Promise<ResponseAuthRes>
  register: (args: { username?: string; initialReviewCount?: number }) => Promise<boolean>
  registerOnboarding: (args: StreakReq) => Promise<boolean>
  refreshToken: () => Promise<ResponseAuthRes>
}

const DEFAULT_KEYS = {
  accessToken: 'magicOfConchAccessToken',
  refreshToken: 'magicOfConchRefreshToken',
  username: 'magicOfConchUserName',
}

async function maybeAsync<T>(value: T | Promise<T>): Promise<T> {
  return value instanceof Promise ? value : value
}

async function getStored(storage: StorageLike, key: string): Promise<string | null> {
  return maybeAsync(storage.getItem(key))
}

async function setStored(storage: StorageLike, key: string, value: string): Promise<void> {
  return maybeAsync(storage.setItem(key, value))
}

export function createConchAuthHelpers(deps: ConchAuthDeps): ConchAuthHelpers {
  const accessTokenKey = deps.accessTokenKey || DEFAULT_KEYS.accessToken
  const refreshTokenKey = deps.refreshTokenKey || DEFAULT_KEYS.refreshToken
  const usernameKey = deps.usernameKey || DEFAULT_KEYS.username

  function extractPayload<T>(response: HttpResponse<T>): T {
    return response.data
  }

  function getErrorStatus(error: unknown): number | undefined {
    if (!error || typeof error !== 'object') return undefined
    const e = error as ApiHttpError
    return typeof e.status === 'number' ? e.status : undefined
  }

  function getErrorPayload<T>(error: unknown): T | null {
    if (!error || typeof error !== 'object') return null
    const e = error as ApiHttpError

    if (e.error && typeof e.error === 'object') {
      return e.error as T
    }

    if (e.data && typeof e.data === 'object') {
      return e.data as T
    }

    return null
  }

  async function setTokens(tokens: TokenBundle): Promise<boolean> {
    const tasks: Array<Promise<void>> = []
    if (tokens.accessToken) tasks.push(setStored(deps.storage, accessTokenKey, tokens.accessToken))
    if (tokens.refreshToken) tasks.push(setStored(deps.storage, refreshTokenKey, tokens.refreshToken))
    if (tokens.username) tasks.push(setStored(deps.storage, usernameKey, tokens.username))
    if (tokens.accessToken !== null) deps.swaggerClient.setSecurityData(tokens.accessToken)
    if (tasks.length === 0) return true
    const results = await Promise.allSettled(tasks)
    const allSucceeded = results.every((r) => r.status === 'fulfilled')
    return allSucceeded
  }

  async function login(): Promise<ResponseAuthRes> {
    const osId = OS_ID_DEBUG || (await (deps.getDeviceId ? deps.getDeviceId() : Promise.resolve('unknown-device')))
    try {
      const res = await deps.swaggerClient.authController.login({ osId })
      const payload = extractPayload<ResponseAuthRes>(res)
      const { accessToken, refreshToken: nextRefreshToken, username } = (payload?.data ?? {}) as TokenBundle
      const setTokensResult = await setTokens({ accessToken: accessToken ?? null, refreshToken: nextRefreshToken ?? null, username })
      if (!setTokensResult) {
        return Promise.reject(new Error('Failed to set tokens'))
      }
      // 비즈니스 로직: 세미 유저면 온보딩 필요 코드로 변환
      const claims = decodeJwtPayload(accessToken ?? '') || {}
      if (claims?.role === SEMI_USER_ROLE) {
        return { ...payload, code: NEED_MORE_ONBOARDING_CODE }
      }
      return payload
    } catch (e: unknown) {
      // 로그인에서 400 | 404은 "유저 미등록" 정상 흐름이므로 reject하지 않고 payload를 그대로 반환
      const status = getErrorStatus(e)
      if (status === 400 || status === 404) {
        const payload = getErrorPayload<ResponseAuthRes>(e)
        if (payload) return payload
      }
      return Promise.reject(e)
    }
  }

  async function register(args: Pick<RegisterReq, 'username' | 'initialReviewCount'>) {
    const osId = OS_ID_DEBUG || (await (deps.getDeviceId ? deps.getDeviceId() : Promise.resolve('unknown-device')))
    const osType = deps.getPlatformOS ? deps.getPlatformOS().toUpperCase() : undefined
    const res = await deps.swaggerClient.authController.registerUser({
      osId,
      osType,
      ...args,
    })
    const payload = extractPayload<ResponseAuthRes>(res)
    const { accessToken, refreshToken: newRefresh, username } = (payload?.data ?? {}) as TokenBundle
    return setTokens({ accessToken: accessToken ?? null, refreshToken: newRefresh ?? null, username })
  }

  async function registerOnboarding(args: StreakReq) {
    const res = await deps.swaggerClient.semiUserController.registerStreak(args)
    const payload = extractPayload<ResponseAuthRes>(res)
    const { accessToken, refreshToken: newRefresh } = (payload?.data ?? {}) as TokenBundle
    return setTokens({ accessToken: accessToken ?? null, refreshToken: newRefresh ?? null })
  }

  async function refreshToken(): Promise<ResponseAuthRes> {
    const storedRefresh = await getStored(deps.storage, refreshTokenKey)
    if (!storedRefresh) return login()
    const res = await deps.swaggerClient.authController.reissue({
      headers: { 'Refresh-Token': storedRefresh },
    })
    const payload = extractPayload<ResponseAuthRes>(res)
    const { accessToken, refreshToken: newRefresh, username } = (payload?.data ?? {}) as TokenBundle
    await setTokens({ accessToken: accessToken ?? null, refreshToken: newRefresh ?? null, username })
    return payload
  }

  return {
    setTokens,
    login,
    register,
    registerOnboarding,
    refreshToken,
  }
}
