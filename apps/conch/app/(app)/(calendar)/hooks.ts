import { useState, useEffect, useMemo, Dispatch, SetStateAction, useCallback } from 'react'
import { consts, getToday, reviewGet } from '@conch/utils'
import { useRefresh } from '@conch/hooks/useRefresh'
import type { ReviewForCalendar, MonthlyReviews, MonthlyReviewKey } from './types'

type CalendarCell = {
  date: string
  isToday: boolean
  isFReview: boolean
  isTReview: boolean
}

export function useCalendar({ reviews, year, month }: { reviews: ReviewForCalendar[]; year: number; month: number }): { calendar: CalendarCell[][] } {
  const { reviewType } = consts
  const fReviewDates = reviews.filter((review) => review.feedbackType === reviewType.feeling).map((review) => review.day)
  const tReviewDates = reviews.filter((review) => review.feedbackType === reviewType.thinking).map((review) => review.day)

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
  const [reviews, setReviews] = useState<MonthlyReviews>({})
  const [date, setDate] = useState<number>(new Date().getDate())

  const fetchAndSetReviewData = useCallback(
    async ({ year, month }: { year: number; month: number }) => {
      const thisMonth = new Date().getMonth()
      const isThisMonth = month === thisMonth
      const isFuture = month > thisMonth

      const yearAndMonth: MonthlyReviewKey = `${year}-${month + 1}`

      if (!isThisMonth && !!reviews[yearAndMonth]) return
      if (isFuture) return

      const {
        data: { data: reviewsData },
      } = await reviewGet('/month', { year, month: month + 1 })

      if (isThisMonth && reviewsData?.length === reviews[yearAndMonth]?.length) return
      setReviews((prev) => ({
        ...prev,
        [yearAndMonth]: reviewsData,
      }))
    },
    [reviews],
  )

  useEffect(() => {
    fetchAndSetReviewData({ year, month })
  }, [year, month, fetchAndSetReviewData])

  const refreshWhenDateChanged = useCallback(() => {
    const { date: todayDate } = getToday()
    if (date !== todayDate) {
      setDate(todayDate)
      fetchAndSetReviewData({ year, month })
    }
  }, [date, fetchAndSetReviewData, year, month])

  useRefresh(() => refreshWhenDateChanged())

  const yearAndMonth = useMemo<MonthlyReviewKey>(() => `${year}-${month + 1}`, [year, month])

  return { reviews: reviews[yearAndMonth] || [] }
}

export function useTodayReviewWritten({ reviews, year, month, date }: { reviews: ReviewForCalendar[]; year: number; month: number; date: number }): boolean {
  return reviews?.some((review) => review.day === date) || false
}
