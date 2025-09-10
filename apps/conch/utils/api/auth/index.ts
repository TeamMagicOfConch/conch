import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { consts } from '@conch/utils/consts'
import { AuthToken, AuthRequestBody, AuthResponse } from './types'
import { getConchClient, setConchToken } from '../conchClient'

export const UNREGISTERED_CODE = 'USR-003'
const REFRESH_TOKEN_EXPIRED_CODE = 'SEC-001'
const OS_ID_DEBUG = null

export const authAxios = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL })
authAxios.interceptors.response.use(onResponse, onResponseError)
authAxios.interceptors.request.use(onRequest, onRequestError)

export async function authGet(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<AuthResponse>> {
  return authAxios.get(url, config)
}
export async function authPost(url: string, body: AuthRequestBody, config?: any): Promise<AxiosResponse<AuthResponse>> {
  return authAxios.post(url, body, config)
}

export async function onResponse(response: AxiosResponse<AuthResponse>): Promise<AxiosResponse<AuthResponse>> {
  const { data, config: originalRequest } = response
  const { code, data: authData } = data

  switch (code) {
    case REFRESH_TOKEN_EXPIRED_CODE:
      return authPost('/user/login', { osId: OS_ID_DEBUG || await DeviceInfo.getUniqueId() })
    default:
      return response
  }
}

export async function onResponseError(error: any) {
  const originalRequest = error.config

  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true

    try {
      const { accessToken } = (await refreshToken()).data || {}
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return authAxios(originalRequest)
    } catch (error) {
      console.error('로그인 필요')
      const { accessToken } = (await login()).data || {}
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return authAxios(originalRequest)
    }
  }

  return Promise.reject(error)
}

export async function onRequest(_config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
  const config = { ..._config }
  const token = await AsyncStorage.getItem(consts.asyncStorageKey.accessToken)
  const isAuthentication = config.url?.includes('login') || config.url?.includes('register')
  if (token && !isAuthentication) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['Content-Type'] = 'application/json'
  return config
}

export function onRequestError(error: any) {
  return Promise.reject(error)
}

export function setTokens({ accessToken, refreshToken, username, rest }: AuthToken & { rest?: Promise<any>[] }) {
  return Promise.all([
    ...(accessToken ? [AsyncStorage.setItem(consts.asyncStorageKey.accessToken, accessToken)] : []),
    ...(refreshToken ? [AsyncStorage.setItem(consts.asyncStorageKey.refreshToken, refreshToken)] : []),
    ...(username ? [AsyncStorage.setItem(consts.asyncStorageKey.username, username)] : []),
    ...(rest || []),
  ])
}

const DEFAULT_RESPONSE: AuthResponse = {
  status: 500,
  code: 'NO_RESPONSE',
  message: 'response is empty',
  data: {
    accessToken: null,
    refreshToken: null,
    username: null,
  },
}

export async function register({ username, initialReviewCount }: Pick<AuthRequestBody, 'username' | 'initialReviewCount'>): Promise<AuthResponse> {
  try {
    const { data: axiosData } = await authPost('/user/register', {
      osId: OS_ID_DEBUG || await DeviceInfo.getUniqueId(),
      // osId: 'qwer',
      osType: Platform.OS.toUpperCase(),
      username,
      initialReviewCount,
    })
    return axiosData
  } catch (e) {
    console.error(e)
    return DEFAULT_RESPONSE
  }
}

export async function login(): Promise<AuthResponse> {
  try {
    const osId = OS_ID_DEBUG || await DeviceInfo.getUniqueId()
    const { data } = await getConchClient().authController.login({ osId })
    const { accessToken, refreshToken, username } = (data as any)?.data || {}
    await setTokens({ accessToken, refreshToken, username })
    setConchToken(accessToken)
    return data as AuthResponse
  } catch (e) {
    console.error('re-login failed', e, (e as any).stack)
    return DEFAULT_RESPONSE
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  const _refreshToken = await AsyncStorage.getItem(consts.asyncStorageKey.refreshToken)
  if (!_refreshToken) return login()

  try {
    const { data: responseData } = await getConchClient().authController.reissue({
      headers: { 'Refresh-Token': _refreshToken },
    })
    const { accessToken, refreshToken, username } = (responseData as any)?.data || {}

    setTokens({ accessToken, refreshToken, username })
    setConchToken(accessToken)

    return responseData as any
  } catch (e) {
    console.warn('reissue failed', e)
    return DEFAULT_RESPONSE
  }
}
