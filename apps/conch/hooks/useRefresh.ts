import { useEffect, useRef, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'

import { login, refreshToken } from '@conch/utils'

export function useRefresh(callback?: (elapsed?: number) => void) {
  const appState = useRef(AppState.currentState)
  const lastBackgroundTime = useRef<number | undefined>(undefined)

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    console.log('handleAppStateChange', appState.current, nextAppState)
    if (appState.current.match(/active/) && nextAppState.match(/background|inactive/)) {
      lastBackgroundTime.current = Date.now()
    }

    if (appState.current.match(/background|inactive/) && nextAppState === 'active') {
      const now = Date.now()
      const elapsed = now - (lastBackgroundTime.current || now)
      const elapsedMinutes = elapsed / (1000 * 60)
      const elapsedDay = elapsed / (1000 * 60 * 60 * 24)
      console.log(elapsedDay, elapsedMinutes)

      if (elapsedMinutes > 10 && elapsedDay < 1) {
        refreshToken()
      } else if (elapsedDay > 1) {
        login()
      }

      callback?.(elapsed)
    }

    appState.current = nextAppState
  }, [callback])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [handleAppStateChange])
}
