import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { consts, getToday, inquiryMonth, list } from '@conch/utils'
import { useRefresh } from '@conch/hooks/useRefresh'
import { usePathname } from 'expo-router'
import type { ReviewForCalendar, MonthlyReviews, MonthlyReviewKey, ReviewForList } from './types'

// Custom hook to detect when user returns to home screen
function useHomeReturn(callback: () => void) {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    const isReturningHome = prevPathname.current !== pathname && (pathname === '/' || pathname.includes('(home)'))
    
    if (isReturningHome) {
      callback()
    }
    
    prevPathname.current = pathname
  }, [pathname, callback])
}

type CalendarCell = {
  date: string
  isToday: boolean
  isFReview: boolean
  isTReview: boolean
}

export function useCalendar({ reviews: _reviews, year, month }: { reviews: ReviewForCalendar[]; year: number; month: number }): { calendar: CalendarCell[][] } {
  const { reviewType } = consts
  const reviews = _reviews.filter((review) => review.month === month + 1)
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
  const reviewsRef = useRef<MonthlyReviews>({})
  const [date, setDate] = useState<number>(new Date().getDate())

  const fetchAndSetReviewData = useCallback(
    async ({ year: targetYear, month: targetMonth }: { year: number; month: number }) => {
      const { year: thisYear, month: thisMonth } = getToday()
      const isThisMonth = targetYear === thisYear && targetMonth === thisMonth
      const isFuture = !(targetYear < thisYear || (targetYear === thisYear && targetMonth <= thisMonth))

      const yearAndMonth: MonthlyReviewKey = `${targetYear}-${targetMonth + 1}`

      if (!isThisMonth && !!reviewsRef.current[yearAndMonth]) return
      if (isFuture) return

      const _reviewsData = await inquiryMonth({ year: targetYear, month: targetMonth + 1 })
      const reviewsData = _reviewsData?.map((review) => ({
        month: targetMonth + 1,
        ...review,
      })) || []

      setReviews((prev) => {
        const newReviews = {
          ...prev,
          [yearAndMonth]: reviewsData,
        }
        reviewsRef.current = newReviews
        return newReviews
      })
    },
    [],
  )

  useEffect(() => {
    fetchAndSetReviewData({ year, month })
  }, [year, month, fetchAndSetReviewData])

  // (home)으로 돌아올 때 현재월 데이터 refetch
  useHomeReturn(useCallback(() => {
    const { year: thisYear, month: thisMonth } = getToday()
    const isThisMonth = year === thisYear && month === thisMonth
    
    if (isThisMonth) {
      fetchAndSetReviewData({ year, month })
    }
  }, [year, month, fetchAndSetReviewData]))

  const refreshWhenDateChanged = useCallback(() => {
    const { date: todayDate } = getToday()
    if (date !== todayDate) {
      setDate(todayDate)
      fetchAndSetReviewData({ year, month })
    }
  }, [date, fetchAndSetReviewData, year, month])

  useRefresh(() => refreshWhenDateChanged())

  return { reviews: Object.values(reviews).flat() || [] }
}

export function useTodayReviewWritten({ reviews, date }: { reviews: ReviewForCalendar[]; year: number; month: number; date: number }): boolean {
  return reviews?.some((review) => review.day === date) || false
}

export function useReviewList() {
  const [reviews, setReviews] = useState<ReviewForList[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
      // Failed to fetch reviews
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch reviews:', error)
      }
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
    if (reviews.length === 0) {
      fetchReviews()
    }
  }, [fetchReviews, reviews.length])

  // (home)으로 돌아올 때 리스트 데이터 refetch
  useHomeReturn(useCallback(() => {
    fetchReviews()
  }, [fetchReviews]))

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
