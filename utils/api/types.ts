import { Review } from '@/types/review'

export interface CommonResponse<T> {
  status: number
  code: string
  message: string
  data: T
}

export interface AuthRequestBody {
  osId: string
  osType?: string
  username?: string
  initialReviewCount?: number
}

export interface AuthToken {
  accessToken: string | null
  refreshToken: string | null
}

export interface ReviewSubmitRequestBody {
  body: string
  type: Review['feedbackType']
  reviewDate: string
}

export interface ReviewListRequestBody {
  year: number
  month: number
}
