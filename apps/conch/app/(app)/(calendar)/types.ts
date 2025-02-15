import { FeedbackType } from '@conch/utils/api/review/types'

export type MonthlyReviewKey = `${number}-${number}`

export interface ReviewForCalendar {
  day: number
  feedbackType: FeedbackType
}

export type MonthlyReviews = Record<MonthlyReviewKey, ReviewForCalendar[]>
