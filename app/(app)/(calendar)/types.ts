import { RawReview } from '@/types/review'

export type MonthlyReviewKey = `${number}-${number}`

export interface ReviewForCalendar {
  day: number
  feedbackType: RawReview['feedbackType']
}

export type MonthlyReviews = Record<MonthlyReviewKey, ReviewForCalendar[]>
