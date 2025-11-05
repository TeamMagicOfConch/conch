import { useState, useEffect, useMemo, Dispatch, SetStateAction, useCallback } from 'react'
import { consts, getToday, inquiryMonth, list } from '@conch/utils'
import { useRefresh } from '@conch/hooks/useRefresh'
import { useIsFocused } from '@react-navigation/native'
import type { ReviewForCalendar, MonthlyReviews, MonthlyReviewKey, ReviewForList } from './types'

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
  const isFocused = useIsFocused()

  const fetchAndSetReviewData = useCallback(
    async ({ year, month }: { year: number; month: number }) => {
      const { year: thisYear, month: thisMonth } = getToday()
      const isThisMonth = year === thisYear && month === thisMonth
      const isFuture = !(year < thisYear || (year === thisYear && month <= thisMonth))

      const yearAndMonth: MonthlyReviewKey = `${year}-${month + 1}`

      if (!isThisMonth && !!reviews[yearAndMonth]) return
      if (isFuture) return

      const reviewsData = await inquiryMonth({ year, month: month + 1 })

      if (isThisMonth && reviewsData?.length === reviews[yearAndMonth]?.length) return
      setReviews((prev) => ({
        ...prev,
        [yearAndMonth]: reviewsData,
      }))
    },
    [reviews],
  )

  useEffect(() => {
    if (isFocused) fetchAndSetReviewData({ year, month })
  }, [year, month, fetchAndSetReviewData, isFocused])

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

export function useReviewList() {
  const [reviews, setReviews] = useState<ReviewForList[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isFocused = useIsFocused()

  const fetchReviews = useCallback(async (cursor?: string) => {
    try {
      setIsLoading(true)
      const response = await list(cursor ? { after: cursor } : undefined)
      
      if (response?.items) {
        const newReviews: ReviewForList[] = response.items.map((item) => ({
          feedbackType: item.feedbackType || 'FEELING',
          body: item.body || '',
          reviewDate: item.reviewDate || '',
        }))

        if (cursor) {
          setReviews((prev) => [...prev, ...newReviews])
        } else {
          setReviews(newReviews)
        }
      }

      setNextCursor(response?.hasNext ? response.nextCursor || null : null)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const loadMore = useCallback(() => {
    if (nextCursor && !isLoading) {
      fetchReviews(nextCursor)
    }
  }, [nextCursor, isLoading, fetchReviews])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    await fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    if (isFocused && reviews.length === 0) {
      fetchReviews()
    }
  }, [isFocused, fetchReviews, reviews.length])

  useRefresh(() => refresh())

  return {
    reviews,
    isLoading,
    isRefreshing,
    loadMore,
    refresh,
    hasMore: !!nextCursor,
  }
}
