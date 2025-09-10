import { Api as ConchApi } from './types/conchApi'
import { ApiClient, ApiClientConfig, createApiClient } from '../common/client'
export * from './sse'

export function createConchApiClient(config: ApiClientConfig): ApiClient {
  return createApiClient(config)
}

export function createConchSwaggerClient(baseURL: string) {
  return new ConchApi({
    baseURL,
    withCredentials: true,
  })
}

export function setConchAuthToken(
  apiClient: ApiClient | null | undefined,
  swaggerClient: InstanceType<typeof ConchApi> | null | undefined,
  token: string,
) {
  if (apiClient) {
    apiClient.getAxiosInstance().defaults.headers.common.Authorization = `Bearer ${token}`
  }
  if (swaggerClient && typeof (swaggerClient as any).setSecurityData === 'function') {
    ;(swaggerClient as any).setSecurityData(token)
  }
}

export function clearConchAuthToken(
  apiClient: ApiClient | null | undefined,
  swaggerClient: InstanceType<typeof ConchApi> | null | undefined,
) {
  if (apiClient) {
    // eslint-disable-next-line no-param-reassign
    delete apiClient.getAxiosInstance().defaults.headers.common.Authorization
  }
  if (swaggerClient && typeof (swaggerClient as any).setSecurityData === 'function') {
    ;(swaggerClient as any).setSecurityData(null)
  }
}

// 생성된 API 타입을 네임스페이스로 내보내 충돌 방지
export * as ConchApiTypes from './types/conchApi'


