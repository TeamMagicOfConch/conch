import AsyncStorage from '@react-native-async-storage/async-storage'
import { consts } from './consts'

export function setTokens({ accessToken, refreshToken, rest }: { accessToken?: string; refreshToken?: string; rest?: Promise<any>[] }) {
  const now = new Date()

  return Promise.all([
    ...(accessToken ? [AsyncStorage.setItem(consts.asyncStorageKey.accessToken, accessToken)] : []),
    ...(refreshToken ? [AsyncStorage.setItem(consts.asyncStorageKey.refreshToken, refreshToken)] : []),
    ...(accessToken && refreshToken
      ? [AsyncStorage.setItem(consts.asyncStorageKey.tokenExpiresAt, new Date(now.getTime() + consts.tokenDuration - 6000).toISOString())]
      : []),
    ...(rest ? rest : []),
  ])
}

const DEFAULT_TOKENS = {
  accessToken: null,
  refreshToken: null,
}

export async function refreshToken() {
  console.log('refresh auth')
  const _refreshToken = await AsyncStorage.getItem(consts.asyncStorageKey.refreshToken)
  if (!_refreshToken) return DEFAULT_TOKENS

  try {
    const refreshResponse = await fetch(`${process.env.EXPO_PUBLIC_TEMP_API_URL}/user/reissue`, {
      method: 'GET',
      headers: {
        'Refresh-Token': _refreshToken,
      },
    })
    const {
      data: { accessToken, refreshToken },
    } = await refreshResponse.json()
    setTokens({ accessToken, refreshToken })

    return { accessToken, refreshToken }
  } catch (e) {
    console.warn('reissue failed', e)
    return DEFAULT_TOKENS
  }
}

export async function fetchWithAuth(url: string, _options?: RequestInit) {
  try {
    const tokenExpiresAt = new Date((await AsyncStorage.getItem(consts.asyncStorageKey.tokenExpiresAt)) as string)
    const tokenExpireExpected = tokenExpiresAt.getTime() < new Date().getTime()

    const accessToken = tokenExpireExpected ? (await refreshToken())?.accessToken : await AsyncStorage.getItem(consts.asyncStorageKey.accessToken)

    const options = {
      ..._options,
      headers: {
        ..._options?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    }

    const response = await fetch(url, options)

    if (response.status === 200) return response

    const { accessToken: refreshedAccessToken } = await refreshToken()
    return fetch(url, options)
  } catch (e) {
    console.warn('fetchWithAuth failed', e)
  }
}
