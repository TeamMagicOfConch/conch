import { Api as ConchApi } from './types/conchApi'
import { ApiClient, ApiClientConfig, createApiClient } from '../common/client'

export * from './sse'
export * from './auth'
export * from './review'

export function createConchApiClient(config: ApiClientConfig): ApiClient {
  return createApiClient(config)
}

export function createConchSwaggerClient(baseURL: string) {
  return new ConchApi({
    baseUrl: baseURL,
    baseApiParams: {
      credentials: 'include',
      format: 'json',
    },
  })
}

export function setConchAuthToken(apiClient: ApiClient | null | undefined, swaggerClient: InstanceType<typeof ConchApi> | null | undefined, token: string) {
  if (apiClient) {
    apiClient.setAuthToken(token)
  }
  if (swaggerClient) {
    swaggerClient.setSecurityData(token)
  }
}

export function clearConchAuthToken(apiClient: ApiClient | null | undefined, swaggerClient: InstanceType<typeof ConchApi> | null | undefined) {
  if (apiClient) {
    apiClient.clearAuthToken()
  }
  if (swaggerClient) {
    swaggerClient.setSecurityData(null)
  }
}

// 생성된 API 타입을 네임스페이스로 내보내 충돌 방지
export * as ConchApiTypes from './types/conchApi'
