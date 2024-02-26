import { useState, useEffect, useMemo } from 'react'
import { useLogin } from '@/hooks'
import { getApiUrlWithPathAndParams } from '@utils/string'

export function useCalendar({ year, month }: { year: number; month: number }) {
  const calendar = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()
    const endDay = lastDay.getDay()

    const calendarArray = Array.from({ length: daysInMonth }, (_, i) => String(new Date(year, month, i + 1).getDate()))
    const paddingStart = Array.from({ length: startDay }, () => '')
    const paddingEnd = Array.from({ length: 6 - endDay }, () => '')

    return paddingStart.concat(calendarArray, paddingEnd).reduce<string[][]>((acc, date) => {
      if (acc.length === 0 || acc[acc.length - 1].length === 7) {
        acc.push([date])
      } else {
        acc[acc.length - 1].push(date)
      }
      return acc
    }, [])
  }, [year, month])

  return { calendar }
}

interface RawReview {
  id: number
  date: string
  diary_text: string
  response_type: 'thinking' | 'feeling'
  response_text: string
  user_id: number
}

interface ReviewForCalendar {
  date: number
  responseType: 'thinking' | 'feeling'
}

export function useReviewDataAtMonth({ year, month }: { year: number; month: number }) {
  const [reviews, setReviews] = useState<ReviewForCalendar[]>([])
  const { userId } = useLogin()

  const yearAndMonth = `${year}-${month + 1}`
  const url = getApiUrlWithPathAndParams({ path: '/diary/calendar', params: { year_and_month: yearAndMonth, user_id: userId } })

  useEffect(() => {
    // TODO: make device cache to reduce api call
    setReviews([])
    fetch(url)
      .then((response) => response.json())
      .then((rawReviews) => {
        if (rawReviews !== undefined && rawReviews?.detail !== 'Not found.') {
          setReviews(
            rawReviews.map((review: RawReview) => ({
              date: new Date(review.date).getDate(),
              responseType: review.response_type,
            })),
          )
        }
      })
      .catch((error) => {
        console.error('useReviewDataAtMonth', error)
      })
  }, [url])

  return { reviews }
}
