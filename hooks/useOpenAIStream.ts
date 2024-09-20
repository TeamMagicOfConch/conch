import { useState, useEffect } from 'react'
import { fetch } from 'react-native-fetch-api'
import type { Review } from '@/types/review'
import { getApiUrlWithPathAndParams } from '@/utils'

const CHUNK_REGEX = /data:(.*)/g

export function useOpenAIStream(props?: Review) {
  if (!props) return null
  const { body: reviewBody, responseType } = props
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const streamData = async () => {
      setLoading(true)
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
            type: 'FEELING',
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
          const chunk = decoder.decode(value, { stream: true })
          const matches = [...chunk.matchAll(CHUNK_REGEX)]
          matches?.forEach((match) => {
            if (match && match[1]) {
              const data = match[1]
              if (data === '{done}') return
              setResponse((prev) => prev + (data || ''))
            }
          })
        }
      } catch (e) {
        console.log(e)
        if (e instanceof Error) {
          setError(e.message)
          setResponse(`error occurred: ${e.message}`)
        }
      } finally {
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
