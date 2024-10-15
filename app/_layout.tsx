import { useCallback } from 'react'
import { View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { polyfill } from '@/utils'
import { Slot } from 'expo-router'
import { useStartUp } from './useStartUp'

polyfill()
SplashScreen.preventAutoHideAsync()

export default function Layout() {
  const { isAppReady, error } = useStartUp()

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) await SplashScreen.hideAsync()
  }, [isAppReady])

  if (!isAppReady) return null
  if (error) console.error(error)

  return (
    <View
      style={{ flex: 1 }}
      onLayout={onLayoutRootView}
    >
      <Slot />
    </View>
  )
}
