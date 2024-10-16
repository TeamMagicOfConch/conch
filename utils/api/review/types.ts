export type FeedbackType = 'FEELING' | 'THINKING'

export interface RawReview {
  body: string
  feedback: string
  date: string
}

export interface RawReviewListItem {
  day: number
  feedbackType: FeedbackType
}

export type RawReviewList = RawReviewListItem[]

export interface Review {
  body: string
  feedback: string
  feedbackType?: FeedbackType
}

export interface ReviewSubmitRequestBody {
  body: string
  type: FeedbackType
  reviewDate: string
}

export interface ReviewQueryParam {
  year: number
  month: number
  day?: number
}
