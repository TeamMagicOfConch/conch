import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { Api as ConchApi, ResponseAuthRes } from './types/conchApi'
import { decodeJwtPayload } from './util'
import { REFRESH_TOKEN_EXPIRED_CODE, SEMI_USER_ROLE, NEED_MORE_ONBOARDING_CODE, OS_ID_DEBUG } from './consts'

export { UNREGISTERED_CODE, REFRESH_TOKEN_EXPIRED_CODE, SEMI_USER_ROLE, NEED_MORE_ONBOARDING_CODE } from './consts'

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

export type ConchAuthHelpers = {
  setTokens: (tokens: TokenBundle) => Promise<void>
  login: () => Promise<ResponseAuthRes>
  register: (args: { username?: string; initialReviewCount?: number }) => Promise<ResponseAuthRes>
  refreshToken: () => Promise<ResponseAuthRes>
}

const DEFAULT_KEYS = {
  accessToken: 'CONCH_ACCESS_TOKEN',
  refreshToken: 'CONCH_REFRESH_TOKEN',
  username: 'CONCH_USERNAME',
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

export function createConchAuthHelpers(
  deps: ConchAuthDeps,
): ConchAuthHelpers {
  const accessTokenKey = deps.accessTokenKey || DEFAULT_KEYS.accessToken
  const refreshTokenKey = deps.refreshTokenKey || DEFAULT_KEYS.refreshToken
  const usernameKey = deps.usernameKey || DEFAULT_KEYS.username

  const axiosInstance = deps.swaggerClient.instance

  async function setTokens(tokens: TokenBundle): Promise<void> {
    const tasks: Array<Promise<void>> = []
    if (tokens.accessToken) tasks.push(setStored(deps.storage, accessTokenKey, tokens.accessToken))
    if (tokens.refreshToken) tasks.push(setStored(deps.storage, refreshTokenKey, tokens.refreshToken))
    if (tokens.username) tasks.push(setStored(deps.storage, usernameKey, tokens.username))
    if (tokens.accessToken !== null) deps.swaggerClient.setSecurityData(tokens.accessToken)
    await Promise.all(tasks)
  }

  async function login() {
    // const osId = OS_ID_DEBUG || (await (deps.getDeviceId ? deps.getDeviceId() : Promise.resolve('unknown-device')))
    const osId = (await (deps.getDeviceId ? deps.getDeviceId() : Promise.resolve('unknown-device')))
    try {
      const res = await deps.swaggerClient.authController.login({ osId })
      const payload = res.data
      console.log('payload', payload)
      const { accessToken, refreshToken, username } = (payload?.data ?? {}) as TokenBundle
      await setTokens({ accessToken: accessToken ?? null, refreshToken: refreshToken ?? null, username })
      // 비즈니스 로직: 세미 유저면 온보딩 필요 코드로 변환
      const claims = decodeJwtPayload(accessToken ?? '') || {}
      if (claims?.role === SEMI_USER_ROLE) {
        return { ...payload, code: NEED_MORE_ONBOARDING_CODE }
      }
      return payload
    } catch (error: any) {
      // 로그인에서 400은 "유저 미등록" 정상 흐름이므로 reject하지 않고 payload를 그대로 반환
      if (error?.response?.status === 400) {
        const payload = error.response.data
        return payload
      }
      return Promise.reject(error)
    }
  }

  async function register(args: { username?: string; initialReviewCount?: number }) {
    const osId = (await (deps.getDeviceId ? deps.getDeviceId() : Promise.resolve('unknown-device')))
    const osType = deps.getPlatformOS ? deps.getPlatformOS().toUpperCase() : undefined
    const res = await deps.swaggerClient.authController.registerUser({
      osId,
      osType,
      username: args.username,
      initialReviewCount: args.initialReviewCount,
    })
    const payload = res.data
    return payload
  }

  async function refreshToken() {
    const storedRefresh = await getStored(deps.storage, refreshTokenKey)
    if (!storedRefresh) return login()
    const res = await deps.swaggerClient.authController.reissue({
      headers: { 'Refresh-Token': storedRefresh },
    })
    const payload = res.data
    const { accessToken, refreshToken: newRefresh, username } = (payload?.data ?? {}) as TokenBundle
    await setTokens({ accessToken: accessToken ?? null, refreshToken: newRefresh ?? null, username })
    return payload
  }

  async function onRequest(_config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    const config = { ..._config }
    const token = await getStored(deps.storage, accessTokenKey)
    const url = config.url || ''
    const isAuthentication = url.includes('login') || url.includes('register')
    if (token && !isAuthentication) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`
    }
    // eslint-disable-next-line no-param-reassign
    config.headers['Content-Type'] = 'application/json'
    return config
  }

  async function onRequestError(error: any): Promise<never> {
    return Promise.reject(error)
  }

  async function onResponse<T = any>(response: AxiosResponse<T>): Promise<AxiosResponse<T>> {
    const anyRes: any = response
    const code: string | undefined = anyRes?.data?.code
    if (code === REFRESH_TOKEN_EXPIRED_CODE) {
      await login()
      return response
    }
    return response
  }

  async function onResponseError(error: any): Promise<any> {
    const originalRequest = error.config || {}

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // eslint-disable-next-line no-param-reassign
      originalRequest._retry = true
      try {
        const res = await refreshToken()
        const newAccess = res?.data?.accessToken ?? null
        if (newAccess) {
          // eslint-disable-next-line no-param-reassign
          originalRequest.headers = originalRequest.headers || {}
          // eslint-disable-next-line no-param-reassign
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
        }
        return axiosInstance(originalRequest)
      } catch {
        const res = await login()
        const newAccess = res?.data?.accessToken ?? null
        if (newAccess) {
          // eslint-disable-next-line no-param-reassign
          originalRequest.headers = originalRequest.headers || {}
          // eslint-disable-next-line no-param-reassign
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
        }
        return axiosInstance(originalRequest)
      }
    }

    return Promise.reject(error)
  }

  // 중복 등록 방지
  const flag = '__conchAuthInterceptors__'
  const hasInterceptors = (axiosInstance as any)[flag]
  if (!hasInterceptors) {
    axiosInstance.interceptors.response.use(onResponse, onResponseError)
    axiosInstance.interceptors.request.use(onRequest, onRequestError)
    ;(axiosInstance as any)[flag] = true
  }

  return {
    setTokens,
    login,
    register,
    refreshToken,
  }
}
