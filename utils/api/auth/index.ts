import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { consts } from '@/utils/consts'
import { AuthToken, AuthRequestBody, AuthResponse } from './types'

const UNREGISTERED_CODE = 'USR-003'
const REFRESH_TOKEN_EXPIRED_CODE = 'SEC-001'

export const authAxios = axios.create({ baseURL: process.env.EXPO_PUBLIC_TEMP_API_URL })
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
    // this logic will be replaced after onboarding developed
    case UNREGISTERED_CODE:
      console.log('register')
      return await authPost('/user/register', {
        // osId: await DeviceInfo.getUniqueId(),
        osId: 'qwer',
        osType: Platform.OS.toUpperCase(),
        username: new Date().toISOString(),
        initialReviewCount: 5,
      })
    case REFRESH_TOKEN_EXPIRED_CODE:
      return await authPost('/user/login', { osId: await DeviceInfo.getUniqueId() })
    default:
      return response
  }
}

export async function onResponseError(error: any) {
  const originalRequest = error.config

  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true

    try {
      const { accessToken } = await refreshToken()
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`

      return authAxios(originalRequest)
    } catch (error) {
      console.error('로그인 필요')
      return Promise.reject(error)
    }
  }

  return Promise.reject(error)
}

export async function onRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
  const token = await AsyncStorage.getItem(consts.asyncStorageKey.accessToken)
  const isAuthentication = config.url?.includes('login') || config.url?.includes('register')
  if (token && !isAuthentication) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  config.headers['Content-Type'] = 'application/json'
  return config
}

export function onRequestError(error: any) {
  return Promise.reject(error)
}

export function setTokens({ accessToken, refreshToken, rest }: AuthToken & { rest?: Promise<any>[] }) {
  return Promise.all([
    ...(accessToken ? [AsyncStorage.setItem(consts.asyncStorageKey.accessToken, accessToken)] : []),
    ...(refreshToken ? [AsyncStorage.setItem(consts.asyncStorageKey.refreshToken, refreshToken)] : []),
    ...(rest ? rest : []),
  ])
}

const DEFAULT_TOKENS: AuthToken = {
  accessToken: null,
  refreshToken: null,
}

export async function login(): Promise<AuthToken> {
  try {
    const osId = await DeviceInfo.getUniqueId()
    const { data: axiosData } = await authPost('/user/login', { osId: 'qwer' })
    return axiosData.data
  } catch (e) {
    console.error('re-login failed', e)
    return DEFAULT_TOKENS
  }
}

export async function refreshToken(): Promise<AuthToken> {
  console.log('refresh auth')
  const _refreshToken = await AsyncStorage.getItem(consts.asyncStorageKey.refreshToken)
  if (!_refreshToken) return login()

  try {
    const refreshResponse = await authGet('/user/reissue', {
      headers: {
        'Refresh-Token': _refreshToken,
      },
    })
    const {
      data: { accessToken, refreshToken },
    } = refreshResponse.data

    setTokens({ accessToken, refreshToken })

    return { accessToken, refreshToken }
  } catch (e) {
    console.warn('reissue failed', e)
    return DEFAULT_TOKENS
  }
}
