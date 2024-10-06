import { useState, useEffect } from 'react'
import { fetch } from 'react-native-fetch-api'
import { useSound } from './useSound'
import type { Review } from '@/types/review'
import { getApiUrlWithPathAndParams } from '@/utils'

const CHUNK_REGEX = /{(.*)}/g

export function useOpenAIStream(props?: Review) {
  if (!props) return null
  const { body: reviewBody, responseType } = props
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
      const url = getApiUrlWithPathAndParams({ path: '/test/api/request/review' })

      try {
        const response: Response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: reviewBody,
            type: responseType,
          }),
          reactNative: {
            textStreaming: true,
          },
        })

        const reader = response.body?.getReader()
        const decoder = new TextDecoder('utf8')

        while (isMounted && reader) {
          const data = await reader.read()
          const { done, value } = data ?? {}
          if (done) break
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

    if (!!responseType) streamData()

    return () => {
      isMounted = false
    }
  }, [responseType])

  return { response, loading, error }
}
