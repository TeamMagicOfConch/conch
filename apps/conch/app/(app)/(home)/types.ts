export type MonthlyReviewKey = `${number}-${number}`

export interface ReviewForCalendar {
  day: number
  feedbackType: 'FEELING' | 'THINKING'
}

export type MonthlyReviews = Record<MonthlyReviewKey, ReviewForCalendar[]>

export interface ReviewForList {
  feedbackType: 'FEELING' | 'THINKING'
  body: string
  reviewDate: string // ISO date string (YYYY-MM-DD)
}
