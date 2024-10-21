import { CommonResponse } from '../types'

export interface AuthRequestBody {
  osId: string
  osType?: string
  username?: string
  initialReviewCount?: number
}

export interface AuthToken {
  accessToken: string | null
  refreshToken: string | null
  username: string | null
}

export interface AuthResponseData {
  accessToken: AuthToken['accessToken']
  refreshToken: AuthToken['refreshToken']
  username: string | null
}

export type AuthResponse = CommonResponse<AuthResponseData>
