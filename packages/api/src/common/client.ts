import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
      timeout: config.timeout || 30000,
      withCredentials: true,
    });

    // 요청 인터셉터 설정
    this.client.interceptors.request.use(
      (config) => {
        // 필요한 경우 토큰 추가 등의 작업 수행
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 설정
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // 에러 처리 로직
        return Promise.reject(error);
      }
    );
  }

  // HTTP 메서드 래퍼
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // Axios 인스턴스 직접 접근 메서드
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
} 