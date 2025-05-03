import { createApiClient, ApiClientConfig } from '../common/client';
import { Api } from './types/adminApi';

// Admin API 기본 설정
const defaultConfig: ApiClientConfig = {
  baseURL: process.env.ADMIN_API_URL || 'http://admin.magicofconch.site',
  timeout: 30000,
};

// Admin API 클라이언트 생성 함수
export function createAdminApiClient(config: Partial<ApiClientConfig> = {}) {
  return createApiClient({
    ...defaultConfig,
    ...config,
    headers: {
      ...defaultConfig.headers,
      ...config.headers,
    },
  });
}

// 기본 Admin API 클라이언트 인스턴스
export const adminApiClient = createAdminApiClient();

// Admin API Swagger 클라이언트
export const adminSwaggerClient = new Api({
  baseURL: process.env.ADMIN_API_URL || 'http://admin.magicofconch.site',
});

// 인증 헤더 추가 함수
export function setAuthToken(token: string) {
  // 기존 HTTP 클라이언트에 토큰 설정
  adminApiClient.getAxiosInstance().defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // Swagger 클라이언트에도 토큰 설정
  adminSwaggerClient.setSecurityData(token);
}

// 인증 헤더 제거 함수
export function clearAuthToken() {
  delete adminApiClient.getAxiosInstance().defaults.headers.common['Authorization'];
  adminSwaggerClient.setSecurityData(null);
}

// 생성된 API 타입 내보내기
export * from './types/adminApi';

export default adminSwaggerClient; 