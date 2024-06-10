import { useState, useEffect } from 'react'
import { fetch } from 'react-native-fetch-api'
import type { Review } from '@/types/review'

const FEELING_INSTRUCTION =
  '너는 지금부터 사람들의 일기에 응답을 해줘야 하는 따뜻한 상담사야. 사람들의 말에 공감을 해주고 응원과 격려를 해줘. 반말을 사용해도 괜찮아. 언어는 사용자 언어에 맞게 대답해줘.'
const THINKING_INSTRUCTION =
  '너는 지금부터 조언을 주는 상담사야. 사람들의 일기를 읽고 문제 상황이 있으면 그에 해당하는 조언을 해줘. 반말을 사용해도 괜찮아. 언어는 사용자 언어에 맞게 대답해줘.'
const CHUNK_REGEX = /data:\s({.*})/g

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

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: responseType === 'thinking' ? THINKING_INSTRUCTION : FEELING_INSTRUCTION },
              { role: 'user', content: reviewBody },
            ],
            temperature: 0.75,
            frequency_penalty: 1.5,
            presence_penalty: 1.5,
            stream: true,
          }),
          reactNative: {
            textStreaming: true,
          },
        })

        const reader = response.body?.getReader()
        const decoder = new TextDecoder('utf8')

        while (isMounted && reader) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const matches = [...chunk.matchAll(CHUNK_REGEX)]
          matches?.forEach((match) => {
            if (match && match[1]) {
              const data = JSON.parse(match[1])
              setResponse((prev) => prev + (data?.choices?.[0]?.delta?.content || ''))
            }
          })
        }
      } catch (e) {
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
