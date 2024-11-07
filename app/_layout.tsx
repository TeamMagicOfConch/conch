import { useCallback } from 'react'
import { View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { polyfill } from '@/utils'
import { Slot } from 'expo-router'
import { useStartUp } from './useStartUp'
import OnboardScreen from './onboard'
import { useRefresh } from '@/hooks/useRefresh'

polyfill()
SplashScreen.preventAutoHideAsync()

export default function Layout() {
  useRefresh()
  const { isAppReady, needOnboard, setNeedOnboard, error } = useStartUp()

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) await SplashScreen.hideAsync()
  }, [isAppReady])

  if (!isAppReady) return null
  if (error) console.error(error)

  return needOnboard ? (
    <OnboardScreen setNeedOnboard={setNeedOnboard} />
  ) : (
    <View
      style={{ flex: 1 }}
      onLayout={onLayoutRootView}
    >
      <Slot />
    </View>
  )
}
