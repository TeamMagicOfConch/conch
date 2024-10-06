import { useState, useEffect, useCallback } from 'react'
import { Platform, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import * as SplashScreen from 'expo-splash-screen'
import { polyfill, setTokens } from '@/utils'
import { Slot } from 'expo-router'
import axios from 'axios'

polyfill()
SplashScreen.preventAutoHideAsync()

const REDIRECT_REGISTER_CODE = 'USR-003'

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    async function prepare() {
      try {
        alert('test alert for update test')
        const osId = await DeviceInfo.getUniqueId()
        console.log(osId)
        const body = {
          osId,
          osType: Platform.OS.toUpperCase(),
        }

        const loginResponse = await axios.post(`${process.env.EXPO_PUBLIC_TEMP_API_URL}/user/login`, body)
        const { code, data: loginData } = loginResponse.data

        const registerResponse = code === REDIRECT_REGISTER_CODE ? await axios.post(`${process.env.EXPO_PUBLIC_TEMP_API_URL}/user/register`, body) : null
        const { data: registerData } = registerResponse?.data || {}
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
