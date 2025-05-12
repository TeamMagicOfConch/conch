import { createApiClient, ApiClientConfig } from '../common/client';
import { Api } from './types/adminApi';

// 환경 변수 접근 유틸리티 (Vite와 Node.js 환경 모두 지원)
const getEnv = (key: string, defaultValue?: string) => {
  // @ts-ignore - Vite 환경을 위한 처리
  if (import.meta && import.meta.env) {
    // @ts-ignore
    console.table(import.meta.env)
    // @ts-ignore
    return import.meta.env[key] || defaultValue;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

// Admin API 기본 설정
const defaultConfig: ApiClientConfig = {
  baseURL: getEnv('VITE_ADMIN_API_URL'),
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
  baseURL: getEnv('ADMIN_API_URL'),
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