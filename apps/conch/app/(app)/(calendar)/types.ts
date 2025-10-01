export type MonthlyReviewKey = `${number}-${number}`

export interface ReviewForCalendar {
  day: number
  feedbackType: 'FEELING' | 'THINKING'
}

export type MonthlyReviews = Record<MonthlyReviewKey, ReviewForCalendar[]>
