import { useEffect, useState } from 'react'
import { setTokens } from '@/utils'
import { login } from '@/utils/api'

export function useStartUp() {
  const [isAppReady, setIsAppReady] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    async function prepare() {
      try {
        const res = await login()
        const { accessToken, refreshToken } = res

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

  return { isAppReady, error }
}
