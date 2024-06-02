export interface RawReview {
  id: number
  date: string
  diary_text: string
  response_type: 'thinking' | 'feeling'
  response_text: string
  user_id: number
}

export interface Review {
  body: RawReview['diary_text']
  responseType: RawReview['response_type'] | null
  responseBody: RawReview['response_text']
}
