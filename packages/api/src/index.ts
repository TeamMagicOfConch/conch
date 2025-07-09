import { createAdminSwaggerClient } from './admin'

// 공통 클라이언트 내보내기
export * from './common/client'

// Admin API 내보내기
export * from './admin'

// Conch API는 나중에 추가 예정
// export * from './conch';

// 편의를 위한 기본 내보내기
export default {
  admin: createAdminSwaggerClient(import.meta.env.VITE_ADMIN_API_URL),
  // conch: conchApiClient, // 나중에 추가 예정
}
