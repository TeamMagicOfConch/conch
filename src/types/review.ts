export interface RawReview {
  id: number
  date: string
  diary_text: string
  response_type: 'thinking' | 'feeling'
  response_text: string
  user_id: number
}
