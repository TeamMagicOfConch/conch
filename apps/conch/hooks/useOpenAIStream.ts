import { useState, useEffect } from 'react'
import { fetch } from 'expo/fetch'
import { submitReviewSSE } from '@conch/api'
import type { Review } from '@conch/utils/api/review/types'
import { consts, refreshToken } from '@conch/utils'
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
      const accessToken = await AsyncStorage.getItem(consts.asyncStorageKey.accessToken)

      try {
        await submitReviewSSE({
          baseURL: process.env.EXPO_PUBLIC_API_URL as string,
          // path 기본값: '/stream/review'
          review: {
            body: reviewBody,
            type: feedbackType,
            // reviewDate 미지정 시 헬퍼에서 KST(+9) yyyy-MM-dd 자동 생성
          } as any,
          token: accessToken,
          refreshToken: async () => (await refreshToken())?.data?.accessToken ?? null,
          login: async () => (await login())?.data?.accessToken ?? null,
          fetchImpl: fetch,
          onChunk: (text) => setResponse((prev) => prev + (text || '')),
          onError: (e) => {
            setError(e.message)
            setResponse(`error occurred: ${e.message}`)
          },
        })
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
