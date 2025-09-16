import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { consts } from '@conch/utils/consts'
import { AuthToken, AuthRequestBody, AuthResponse } from './types'
import { getConchClient, setConchToken } from '../conchClient'

// Base64URL → bytes (no external libs)
/* eslint-disable no-bitwise, no-plusplus, no-continue */
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function base64UrlToBase64(input: string): string {
  let output = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = output.length % 4
  if (padLen === 2) output += '=='
  else if (padLen === 3) output += '='
  else if (padLen === 1) throw new Error('Invalid base64url string')
  return output
}

function decodeBase64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '')
  const bytes: number[] = []
  let i = 0
  while (i < clean.length) {
    const enc1 = BASE64_ALPHABET.indexOf(clean.charAt(i++))
    const enc2 = BASE64_ALPHABET.indexOf(clean.charAt(i++))
    const enc3 = BASE64_ALPHABET.indexOf(clean.charAt(i++))
    const enc4 = BASE64_ALPHABET.indexOf(clean.charAt(i++))

    const chr1 = (enc1 << 2) | (enc2 >> 4)
    bytes.push(chr1 & 0xff)

    if (clean.charAt(i - 2) !== '=') {
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
      bytes.push(chr2 & 0xff)
    }
    if (clean.charAt(i - 1) !== '=') {
      const chr3 = ((enc3 & 3) << 6) | enc4
      bytes.push(chr3 & 0xff)
    }
  }
  return new Uint8Array(bytes)
}

function utf8BytesToString(bytes: Uint8Array): string {
  let out = ''
  let i = 0
  while (i < bytes.length) {
    const b0 = bytes[i++]
    if (b0 < 0x80) {
      out += String.fromCharCode(b0)
      continue
    }
    if (b0 < 0xe0) {
      const b1 = bytes[i++] & 0x3f
      const code = ((b0 & 0x1f) << 6) | b1
      out += String.fromCharCode(code)
      continue
    }
    if (b0 < 0xf0) {
      const b1 = bytes[i++] & 0x3f
      const b2 = bytes[i++] & 0x3f
      const code = ((b0 & 0x0f) << 12) | (b1 << 6) | b2
      out += String.fromCharCode(code)
      continue
    }
    const b1 = bytes[i++] & 0x3f
    const b2 = bytes[i++] & 0x3f
    const b3 = bytes[i++] & 0x3f
    let codepoint = ((b0 & 0x07) << 18) | (b1 << 12) | (b2 << 6) | b3
    codepoint -= 0x10000
    out += String.fromCharCode(0xd800 + ((codepoint >> 10) & 0x3ff))
    out += String.fromCharCode(0xdc00 + (codepoint & 0x3ff))
  }
  return out
}

function base64UrlDecodeToString(input: string): string {
  const bytes = decodeBase64ToBytes(base64UrlToBase64(input))
  return utf8BytesToString(bytes)
}

function decodeJwtPayload(token: string): any | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  const json = base64UrlDecodeToString(parts[1])
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}
/* eslint-enable no-bitwise, no-plusplus, no-continue */

export const UNREGISTERED_CODE = 'USR-003'
const REFRESH_TOKEN_EXPIRED_CODE = 'SEC-001'
const SEMI_USER_ROLE = "ROLE_SEMI_USER"
export const NEED_MORE_ONBOARDING_CODE = 'USR-OBD'
const OS_ID_DEBUG = '00328-00260-52319-1111'

export const authAxios = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL })
authAxios.interceptors.response.use(onResponse, onResponseError)
authAxios.interceptors.request.use(onRequest, onRequestError)

export async function authPost(url: string, body: AuthRequestBody, config?: any): Promise<AxiosResponse<AuthResponse>> {
  return authAxios.post(url, body, config)
}

export async function onResponse(response: AxiosResponse<AuthResponse>): Promise<AxiosResponse<AuthResponse>> {
  const { code } = response.data

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
    } catch (e) {
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
    const { role } = decodeJwtPayload(accessToken) || {}
    await setTokens({ accessToken, refreshToken, username })
    setConchToken(accessToken)

    if (role === SEMI_USER_ROLE) {
      return {
        ...(data as AuthResponse),
        code: NEED_MORE_ONBOARDING_CODE,
      }
    }
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
