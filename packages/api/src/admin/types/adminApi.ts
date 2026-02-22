/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AdminSignUpForm {
  adminName?: string
  password?: string
  email?: string
}

export interface LoginRequest {
  adminName?: string
  password?: string
}

export namespace ReviewAnalyzeController {
  /**
   * No description
   * @tags review-analyze-controller
   * @name Decrypt
   * @request POST:/admin/review/decrypt
   * @response `200` `string` OK
   */
  export namespace Decrypt {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = Record<string, string>
    export type RequestHeaders = {}
    export type ResponseBody = string
  }

  /**
   * @description 특정 기간 동안의 사용자 review 데이터를 CSV 파일로 변환하여 응답합니다.
   * @tags review-analyze-controller
   * @name ExportReviewCsv
   * @summary Review 분석 CSV 생성 API
   * @request GET:/admin/review/export
   * @response `200` `void` CSV 파일 생성 완료
   * @response `400` `void` 잘못된 요청
   * @response `401` `void` 인증 실패
   * @response `500` `void` 서버 오류
   */
  export namespace ExportReviewCsv {
    export type RequestParams = {}
    export type RequestQuery = {
      /**
       * 조회 시작일 (yyyy-MM-dd)
       * @format date
       */
      startDate: string
      /**
       * 조회 종료일 (yyyy-MM-dd)
       * @format date
       */
      endDate: string
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = void
  }
}

export namespace AdminSignupController {
  /**
   * No description
   * @tags admin-signup-controller
   * @name Signup
   * @request POST:/admin/api/signup
   * @response `200` `object` OK
   */
  export namespace Signup {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = AdminSignUpForm
    export type RequestHeaders = {}
    export type ResponseBody = object
  }
}

export namespace AdminLoginController {
  /**
   * No description
   * @tags admin-login-controller
   * @name Login
   * @request POST:/admin/api/login
   * @response `200` `object` OK
   */
  export namespace Login {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = LoginRequest
    export type RequestHeaders = {}
    export type ResponseBody = object
  }
}

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'http://admin.magicofconch.site'
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)
  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
    return keys.map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key))).join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) => (input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input),
    [ContentType.JsonApi]: (input: any) => (input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input),
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(key, property instanceof Blob ? property : typeof property === 'object' && property !== null ? JSON.stringify(property) : `${property}`)
        return formData
      }, new FormData())
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  }

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) && this.securityWorker && (await this.securityWorker(this.securityData))) || {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const responseToParse = responseFormat ? response.clone() : response
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      if (!response.ok) throw data
      return data
    })
  }
}

/**
 * @title MagicOfConch Admin API
 * @version v1.0.0
 * @baseUrl http://admin.magicofconch.site
 *
 * 소라 어드민에서 사용하는 API 문서입니다.
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  reviewAnalyzeController = {
    /**
     * No description
     *
     * @tags review-analyze-controller
     * @name Decrypt
     * @request POST:/admin/review/decrypt
     * @response `200` `string` OK
     */
    decrypt: (data: Record<string, string>, params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/admin/review/decrypt`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 특정 기간 동안의 사용자 review 데이터를 CSV 파일로 변환하여 응답합니다.
     *
     * @tags review-analyze-controller
     * @name ExportReviewCsv
     * @summary Review 분석 CSV 생성 API
     * @request GET:/admin/review/export
     * @response `200` `void` CSV 파일 생성 완료
     * @response `400` `void` 잘못된 요청
     * @response `401` `void` 인증 실패
     * @response `500` `void` 서버 오류
     */
    exportReviewCsv: (
      query: {
        /**
         * 조회 시작일 (yyyy-MM-dd)
         * @format date
         */
        startDate: string
        /**
         * 조회 종료일 (yyyy-MM-dd)
         * @format date
         */
        endDate: string
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/admin/review/export`,
        method: 'GET',
        query: query,
        ...params,
      }),
  }
  adminSignupController = {
    /**
     * No description
     *
     * @tags admin-signup-controller
     * @name Signup
     * @request POST:/admin/api/signup
     * @response `200` `object` OK
     */
    signup: (data: AdminSignUpForm, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/admin/api/signup`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  }
  adminLoginController = {
    /**
     * No description
     *
     * @tags admin-login-controller
     * @name Login
     * @request POST:/admin/api/login
     * @response `200` `object` OK
     */
    login: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/admin/api/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  }
}
