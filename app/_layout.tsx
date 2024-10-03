import { useState, useEffect, useCallback } from 'react'
import { Platform, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceInfo from 'react-native-device-info'
import * as SplashScreen from 'expo-splash-screen'
import { polyfill, consts } from '@/utils'
import { Slot } from 'expo-router'

polyfill()
SplashScreen.preventAutoHideAsync()

const REDIRECT_REGISTER_CODE = 'USR-003'

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        const osId = await DeviceInfo.getUniqueId()
        const option = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            osId,
            osType: Platform.OS.toUpperCase(),
          }),
        }

        const loginResponse = await fetch(`${process.env.EXPO_PUBLIC_TEMP_API_URL}/user/login`, option)
        const { code, data: loginData } = await loginResponse.json()

        const registerResponse = code === REDIRECT_REGISTER_CODE ? await fetch(`${process.env.EXPO_PUBLIC_TEMP_API_URL}/user/register`, option) : null
        const { data: registerData } = (await registerResponse?.json()) || {}
        const data = registerData || loginData

        const { accessToken, refreshToken } = data

        await Promise.all([
          ...(accessToken && [AsyncStorage.setItem(consts.asyncStorageKey.accessToken, accessToken)]),
          ...(refreshToken && [AsyncStorage.setItem(consts.asyncStorageKey.refreshToken, refreshToken)]),
          AsyncStorage.setItem(consts.asyncStorageKey.registered, 'true'),
        ])

        setIsAppReady(true)
      } catch (e) {
        console.warn(e)
        alert('로그인 에러 발생')
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) await SplashScreen.hideAsync()
  }, [isAppReady])

  if (!isAppReady) return null

  return (
    <View
      style={{ flex: 1 }}
      onLayout={onLayoutRootView}
    >
      <Slot />
    </View>
  )
}
