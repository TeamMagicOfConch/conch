import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { consts } from '@/utils/consts'
import { AuthToken, AuthRequestBody, AuthResponse } from './types'

export const UNREGISTERED_CODE = 'USR-003'
const REFRESH_TOKEN_EXPIRED_CODE = 'SEC-001'

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
      const { accessToken } = (await refreshToken())?.data
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
      osId: await DeviceInfo.getUniqueId(),
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
    const osId = await DeviceInfo.getUniqueId()
    const { data: axiosData } = await authPost('/user/login', { osId })
    return axiosData
  } catch (e) {
    console.error('re-login failed', e)
    return DEFAULT_RESPONSE
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  console.log('refresh auth')
  const _refreshToken = await AsyncStorage.getItem(consts.asyncStorageKey.refreshToken)
  if (!_refreshToken) return login()

  try {
    const { data: responseData } = await authGet('/user/reissue', {
      headers: {
        'Refresh-Token': _refreshToken,
      },
    })
    const { accessToken, refreshToken } = responseData?.data || {}

    setTokens({ accessToken, refreshToken })

    return responseData
  } catch (e) {
    console.warn('reissue failed', e)
    return DEFAULT_RESPONSE
  }
}
