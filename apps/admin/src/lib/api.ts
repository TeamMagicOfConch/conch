import { createAdminApiClient, createAdminSwaggerClient, setAuthToken, clearAuthToken } from '@api/admin'

// 환경변수 읽기
const apiUrl = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001'

// API 클라이언트 인스턴스 생성
export const adminApiClient = createAdminApiClient({
  baseURL: apiUrl,
  timeout: 30000,
})

export const adminSwaggerClient = createAdminSwaggerClient(apiUrl)

// 인증 관련 유틸리티
export const authTokenUtils = {
  setToken: (token: string) => {
    setAuthToken(adminApiClient, adminSwaggerClient, token)
  },
  clearToken: () => {
    clearAuthToken(adminApiClient, adminSwaggerClient)
  },
}

// 기본 설정
export const apiConfig = {
  baseURL: apiUrl,
}

console.log('Admin API 클라이언트 초기화:', apiConfig) 