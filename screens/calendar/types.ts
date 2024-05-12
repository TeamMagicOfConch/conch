import { RawReview } from '@/types/review'

export type MonthlyReviewKey = `${number}-${number}`

export interface ReviewForCalendar {
  date: number
  responseType: RawReview['response_type']
}

export type MonthlyReviews = Record<MonthlyReviewKey, ReviewForCalendar[]>
