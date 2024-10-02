import { useState, useEffect, useCallback } from 'react'
import { Platform, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceInfo from 'react-native-device-info'
import * as SplashScreen from 'expo-splash-screen'
import { polyfill, consts } from '@/utils'
import { Slot } from 'expo-router'

polyfill()
SplashScreen.preventAutoHideAsync()

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        const osId = await DeviceInfo.getUniqueId()
        // await new Promise((resolve) => setTimeout(resolve, 5000))
        const path = '/user/login'

        const authResponse = await fetch(`${process.env.EXPO_PUBLIC_TEMP_API_URL}${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            osId,
            osType: Platform.OS.toUpperCase(),
          }),
        })
        const {
          data: { accessToken, refreshToken },
        } = await authResponse.json()

        await Promise.all([
          ...(accessToken && [AsyncStorage.setItem(consts.asyncStorageKey.accessToken, accessToken)]),
          ...(refreshToken && [AsyncStorage.setItem(consts.asyncStorageKey.refreshToken, refreshToken)]),
          AsyncStorage.setItem(consts.asyncStorageKey.registered, 'true'),
        ])

        const asyncStorageItems = await Promise.all([
          AsyncStorage.getItem(consts.asyncStorageKey.accessToken),
          AsyncStorage.getItem(consts.asyncStorageKey.refreshToken),
          AsyncStorage.getItem(consts.asyncStorageKey.registered),
        ])
        console.log(asyncStorageItems)
      } catch (e) {
        console.warn(e)
      } finally {
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
