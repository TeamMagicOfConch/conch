import { useCallback } from 'react'
import { View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { Slot } from 'expo-router'
import { useRefresh } from '@conch/hooks/useRefresh'
import { useStartUp } from './useStartUp'
import OnboardScreen from './onboard/index'

SplashScreen.preventAutoHideAsync()

export default function Layout() {
  useRefresh()
  const { isAppReady, needOnboard, setNeedOnboard, error, initialOnboardStep } = useStartUp()

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) await SplashScreen.hideAsync()
  }, [isAppReady])

  if (!isAppReady) return null
  if (error) console.error(error)

  return needOnboard ? (
    <OnboardScreen
      onLayout={onLayoutRootView}
      setNeedOnboard={setNeedOnboard}
      initialStep={initialOnboardStep}
     />
  ) : (
    <View
      style={{ flex: 1 }}
      onLayout={onLayoutRootView}
    >
      <Slot />
    </View>
  )
}
