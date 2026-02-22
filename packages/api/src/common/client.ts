export interface ApiClientConfig {
  baseURL: string
  headers?: Record<string, string>
  timeout?: number
  fetchImpl?: typeof fetch
}

type RequestConfig = RequestInit & {
  timeout?: number
}

export class ApiClient {
  private baseURL: string

  private defaultHeaders: Record<string, string>

  private timeout: number

  private fetchImpl: typeof fetch

  private authToken: string | null = null

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    }
    this.timeout = config.timeout || 30000
    this.fetchImpl = config.fetchImpl || globalThis.fetch
  }

  setAuthToken(token: string) {
    this.authToken = token
  }

  clearAuthToken() {
    this.authToken = null
  }

  private buildHeaders(input?: HeadersInit): Headers {
    const headers = new Headers(this.defaultHeaders)
    if (this.authToken) {
      headers.set('Authorization', `Bearer ${this.authToken}`)
    }

    if (input instanceof Headers) {
      input.forEach((value, key) => headers.set(key, value))
      return headers
    }

    if (Array.isArray(input)) {
      input.forEach(([key, value]) => headers.set(key, value))
      return headers
    }

    Object.entries(input || {}).forEach(([key, value]) => {
      if (typeof value !== 'undefined') {
        headers.set(key, String(value))
      }
    })

    return headers
  }

  private async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const timeout = typeof config.timeout === 'number' ? config.timeout : this.timeout
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await this.fetchImpl(`${this.baseURL}${url}`, {
        ...config,
        credentials: 'include',
        headers: this.buildHeaders(config.headers),
        signal: config.signal || controller.signal,
      })

      const contentType = response.headers.get('content-type') || ''
      const parsedBody = contentType.includes('application/json') ? await response.json() : await response.text()

      if (!response.ok) {
        throw new Error(typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody))
      }

      return parsedBody as T
    } finally {
      clearTimeout(timer)
    }
  }

  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...(config || {}), method: 'GET' })
  }

  async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...(config || {}),
      method: 'POST',
      body: typeof data === 'undefined' ? undefined : JSON.stringify(data),
    })
  }

  async put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...(config || {}),
      method: 'PUT',
      body: typeof data === 'undefined' ? undefined : JSON.stringify(data),
    })
  }

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...(config || {}), method: 'DELETE' })
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...(config || {}),
      method: 'PATCH',
      body: typeof data === 'undefined' ? undefined : JSON.stringify(data),
    })
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}
