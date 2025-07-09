import { createApiClient, ApiClientConfig } from '../common/client'
import { Api } from './types/adminApi'

// 환경 변수 접근 유틸리티 (Vite와 Node.js 환경 모두 지원)
// 환경변수는 클라이언트에서 전달받도록 수정
export const createAdminClient = (apiUrl: string) => {
  // API 클라이언트 생성 로직
  console.log('Admin API URL:', apiUrl)
  return {
    // API 메소드들
  }
}

// Admin API 클라이언트 생성 함수
export function createAdminApiClient(config: ApiClientConfig) {
  return createApiClient(config)
}

// Admin API Swagger 클라이언트 생성 함수
export function createAdminSwaggerClient(baseURL: string) {
  console.log('Admin API URL:', baseURL)
  return new Api({
    baseURL,
    withCredentials: true,
  })
}

// 인증 헤더 추가 함수 (클라이언트 인스턴스를 받아서 처리)
export function setAuthToken(apiClient: any, swaggerClient: any, token: string) {
  // eslint-disable-next-line no-param-reassign
  apiClient.getAxiosInstance().defaults.headers.common.Authorization = `Bearer ${token}`

  // Swagger 클라이언트에도 토큰 설정
  swaggerClient.setSecurityData(token)
}

// 인증 헤더 제거 함수 (클라이언트 인스턴스를 받아서 처리)
export function clearAuthToken(apiClient: any, swaggerClient: any) {
  // eslint-disable-next-line no-param-reassign
  delete apiClient.getAxiosInstance().defaults.headers.common.Authorization
  swaggerClient.setSecurityData(null)
}

// 생성된 API 타입 내보내기
export * from './types/adminApi'
