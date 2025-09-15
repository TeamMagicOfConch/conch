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
  // 서버가 온보딩을 특정 단계에서 시작시키고자 할 때 사용하는 선택 필드
  onboardingStartStep?: number
}

export type AuthResponse = CommonResponse<AuthResponseData>
