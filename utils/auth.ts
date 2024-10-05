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

export async function refreshAuth() {
  console.log('refresh auth')
  const _refreshToken = await AsyncStorage.getItem(consts.asyncStorageKey.refreshToken)
  if (!_refreshToken) return null

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
    await setTokens({ accessToken, refreshToken })
  } catch (e) {
    console.warn('reissue failed', e)
  }
}

export async function fetchWithAuth(url: string, options: RequestInit) {
  const tokenExpiresAt = new Date((await AsyncStorage.getItem(consts.asyncStorageKey.tokenExpiresAt)) as string)
  const tokenExpireExpected = tokenExpiresAt.getTime() < new Date().getTime()

  if (tokenExpireExpected) await refreshAuth()

  try {
  } catch (e) {
    console.warn('fetchWithAuth failed', e)
  }
}
