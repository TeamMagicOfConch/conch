import { useState, useEffect, useCallback } from 'react'
import { Platform, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import * as SplashScreen from 'expo-splash-screen'
import { polyfill, setTokens } from '@/utils'
import { Slot } from 'expo-router'

polyfill()
SplashScreen.preventAutoHideAsync()

const REDIRECT_REGISTER_CODE = 'USR-003'

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    async function prepare() {
      try {
        const osId = await DeviceInfo.getUniqueId()
        console.log(osId)
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

        await setTokens({ accessToken, refreshToken })

        setIsAppReady(true)
      } catch (e) {
        console.warn(e)
        setError(e)
        alert(e)
        setIsAppReady(true)
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
