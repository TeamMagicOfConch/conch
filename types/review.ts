export interface RawReview {
  id: number
  date: string
  diary_text: string
  feedbackType: 'THINKING' | 'FEELING'
  response_text: string
  user_id: number
}

export interface Review {
  body: RawReview['diary_text']
  feedbackType: RawReview['feedbackType'] | null
  responseBody: RawReview['response_text']
}
