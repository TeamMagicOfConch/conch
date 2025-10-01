import { useState, useEffect } from 'react'
import { fetch } from 'expo/fetch'
import { type SubmitReviewSSEOptions } from '@api/conch'
import { submitStreaming } from '@conch/utils/api'
import { useSound } from './useSound'

export function useOpenAIStream(props?: SubmitReviewSSEOptions['review']) {
  const { body: reviewBody, type: feedbackType } = props || {}
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

      try {
        await submitStreaming({
          // path 기본값: '/stream/review'
          review: {
            body: reviewBody,
            type: feedbackType,
            // reviewDate 미지정 시 헬퍼에서 KST(+9) yyyy-MM-dd 자동 생성
          },
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
