import { useState, useEffect } from 'react'
import { fetch } from 'expo/fetch'
import type { Review } from '@conch/utils/api/review/types'
import { consts, getApiUrlWithPathAndParams, refreshToken } from '@conch/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { login } from '@conch/utils/api/auth'
import { useSound } from './useSound'

const CHUNK_REGEX = /{(.*)}/g
const KO_TIME_OFFSET = 9 * 60 * 60 * 1000 // 9시간

export function useOpenAIStream(props?: Review) {
  const { body: reviewBody, feedbackType } = props || {}
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { playSound, setToggleFadeOut } = useSound()

  useEffect(() => {
    let isMounted = true
    const streamData = async () => {
      setLoading(true)
      playSound()
      setResponse('')
      setError(null)
      const url = getApiUrlWithPathAndParams({ path: '/stream/review' })
      const accessToken = await AsyncStorage.getItem(consts.asyncStorageKey.accessToken)

      try {
        const option = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            body: reviewBody,
            type: feedbackType,
            reviewDate: new Date(new Date().getTime() + KO_TIME_OFFSET).toISOString().split('T')[0],
          }),
        }
        const responseFirstAttempt: Response = await fetch(url, option)

        const response =
          responseFirstAttempt.status === 401
            ? await fetch(url, { ...option, headers: { ...option.headers, Authorization: `Bearer ${(await refreshToken())?.data?.accessToken}` } })
            : responseFirstAttempt

        const finalResponse =
          response.status === 401
            ? await fetch(url, { ...option, headers: { ...option.headers, Authorization: `Bearer ${(await login())?.data?.accessToken}` } })
            : response

        const reader = finalResponse.body?.getReader()
        const decoder = new TextDecoder('utf8')

        while (isMounted && reader) {
          const { done, value } = await reader.read()
          if (done) return
          const chunk = decoder.decode(value)
          const matches = [...chunk.matchAll(CHUNK_REGEX)]
          matches?.forEach((match) => {
            if (match && match[0]) {
              const { value } = JSON.parse(match[0])
              setResponse((prev) => prev + (value || ''))
            }
          })
        }
      } catch (e) {
        console.error(e)
        if (e instanceof Error) {
          setError(e.message)
          setResponse(`error occurred: ${e.message}`)
        }
      } finally {
        setToggleFadeOut(true)
        if (isMounted) setLoading(false)
      }
    }

    if (feedbackType) streamData()

    return () => {
      isMounted = false
    }
  }, [feedbackType, playSound, reviewBody, setToggleFadeOut])

  if (!props) return null

  return { response, loading, error }
}
