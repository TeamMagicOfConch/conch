import { useEffect, useState } from 'react'
import { setTokens } from '@conch/utils'
import { UNREGISTERED_CODE, login } from '@conch/utils/api'

export function useStartUp() {
  const [isAppReady, setIsAppReady] = useState(false)
  const [error, setError] = useState<any>(null)
  const [needOnboard, setNeedOnboard] = useState(true)

  useEffect(() => {
    async function prepare() {
      try {
        if (process.env.EXPO_PUBLIC_FORCE_ONBOARDING === 'true') {
          setNeedOnboard(true)
          setIsAppReady(true)
          return
        }

        const res = await login()
        const { code, data } = res

        if (code === UNREGISTERED_CODE) {
          setNeedOnboard(true)
        } else {
          setNeedOnboard(false)
          const { accessToken, refreshToken, username } = data || {}
          await setTokens({ accessToken, refreshToken, username })
        }

        setIsAppReady(true)
      } catch (e) {
        console.warn(e)
        setError(e)
        alert(e)
        setIsAppReady(true)
      }
    }

    prepare()
  }, [needOnboard])

  return { isAppReady, needOnboard, setNeedOnboard, error }
}
