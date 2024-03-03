import { useState, useEffect, useMemo } from 'react'
import { useLogin } from '@/hooks'
import { getApiUrlWithPathAndParams, getToday } from '@/utils'
import type { RawReview, ReviewForCalendar, MonthlyReviews, MonthlyReviewKey } from './types'

type CalendarCell = {
  date: string
  isToday: boolean
  isFReview: boolean
  isTReview: boolean
}

export function useCalendar({ year, month }: { year: number; month: number }): { calendar: CalendarCell[][] } {
  const { reviews } = useReviewDataAtMonth({ year, month })
  const fReviewDates = reviews.filter((review) => review.responseType === 'feeling').map((review) => review.date)
  const tReviewDates = reviews.filter((review) => review.responseType === 'thinking').map((review) => review.date)

  const calendar = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()
    const endDay = lastDay.getDay()

    const calendarArray = Array.from({ length: daysInMonth }, (_, i) => String(new Date(year, month, i + 1).getDate()))
    const paddingStart = Array.from({ length: startDay }, () => '')
    const paddingEnd = Array.from({ length: 6 - endDay }, () => '')

    return paddingStart.concat(calendarArray, paddingEnd).reduce<CalendarCell[][]>((rows, date) => {
      const { year: todayYear, month: todayMonth, date: todayDate } = getToday()
      const dateNumber = Number(date)
      const cell: CalendarCell = {
        date,
        isToday: year === todayYear && month === todayMonth && dateNumber === todayDate,
        isFReview: fReviewDates.includes(dateNumber),
        isTReview: tReviewDates.includes(dateNumber),
      }

      if (rows.length === 0 || rows[rows.length - 1].length === 7) {
        rows.push([cell])
      } else {
        rows[rows.length - 1].push(cell)
      }
      return rows
    }, [])
  }, [year, month, fReviewDates, tReviewDates])

  return { calendar }
}

export function useReviewDataAtMonth({ year, month }: { year: number; month: number }): { reviews: ReviewForCalendar[] } {
  const [reviews, setReviews] = useState<MonthlyReviews>({
    // mock
    '2024-1': [
      { date: 1, responseType: 'thinking' },
      { date: 2, responseType: 'feeling' },
      // ... more reviews
    ],
    '2024-3': [
      { date: 1, responseType: 'thinking' },
      { date: 3, responseType: 'feeling' },
      // ... more reviews
    ],
  })
  const { userId } = useLogin()

  const yearAndMonth: MonthlyReviewKey = `${year}-${month + 1}`
  const url = getApiUrlWithPathAndParams({ path: '/diary/calendar', params: { year_and_month: yearAndMonth, user_id: userId } })

  useEffect(() => {
    if (reviews[yearAndMonth]) return
    if (!userId) return
    fetch(url)
      .then((response) => response.json())
      .then((rawReviews) => {
        if (rawReviews !== undefined && rawReviews?.detail !== 'Not found.') {
          setReviews((prev) => ({
            ...prev,
            [yearAndMonth]: rawReviews.map((review: RawReview) => ({
              date: new Date(review.date).getDate(),
              responseType: review.response_type,
            })),
          }))
        }
      })
      .catch((error) => {
        console.error('useReviewDataAtMonth', error)
      })
  }, [userId, reviews, url, yearAndMonth])

  return { reviews: reviews[yearAndMonth] || [] }
}

export function useTodayReviewWritten({ year, month, date }: { year: number; month: number; date: number }): boolean {
  const { reviews } = useReviewDataAtMonth({ year, month })
  return reviews?.some((review) => review.date === date) || false
}
