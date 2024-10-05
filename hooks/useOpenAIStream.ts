import { useState, useEffect } from 'react'
import { fetch } from 'react-native-fetch-api'
import { useSound } from './useSound'
import type { Review } from '@/types/review'
import { getApiUrlWithPathAndParams } from '@/utils'
import EventSource from 'react-native-sse'
import RNEventSource from 'react-native-event-source'

const CHUNK_REGEX = /data:(.*)/g

export function useOpenAIStream(props?: Review) {
  if (!props) return null
  const { body: reviewBody, responseType } = props
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { playSound, setToggleFadeOut } = useSound()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    playSound()
    setResponse('')
    setError(null)
    const url = getApiUrlWithPathAndParams({ path: '/test/api/request/review' })

    const eventSource = new RNEventSource(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: reviewBody,
        type: 'FEELING',
      }),
      method: 'POST',
    })

    eventSource.addEventListener('open', (e) => console.log('open connection'))
    eventSource.addEventListener('message', (event) => {
      console.log(event)
      setResponse((prev) => prev + event.data)
    })

    eventSource.addEventListener('error', (event) => {
      if (event instanceof Error) {
        setError(event?.message)
      }
      setLoading(false)
      eventSource.close()
    })

    eventSource.addEventListener('open', () => {
      setLoading(false)
    })

    return () => {
      eventSource.close()
    }
  }, [responseType])

  return { response, loading, error }
}
