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

export interface LocalTime {
  /** @format int32 */
  hour?: number;
  /** @format int32 */
  minute?: number;
  /** @format int32 */
  second?: number;
  /** @format int32 */
  nano?: number;
}

export interface StreakReq {
  reviewTime: string;
  reviewAt: LocalTime;
  writeLocation: string;
  aspiration: string;
}

export interface ResponseTokenDto {
  /** @format int32 */
  status?: number;
  code?: string;
  message?: string;
  data?: TokenDto;
}

export interface TokenDto {
  accessToken?: string;
  refreshToken?: string;
}

export interface RegisterReq {
  osId?: string;
  osType?: string;
  username?: string;
  /** @format int32 */
  initialReviewCount?: number;
}

export interface AuthRes {
  accessToken?: string;
  refreshToken?: string;
  username?: string;
}

export interface ResponseAuthRes {
  /** @format int32 */
  status?: number;
  code?: string;
  message?: string;
  data?: AuthRes;
}

export interface LoginReq {
  /**
   * 로그인을 위한 OS ID
   * @example "XXXX-XXXX-XXXX"
   */
  osId?: string;
}

export interface SaveReq {
  body?: string;
  type?: SaveReqTypeEnum;
  /** @format date */
  reviewDate?: string;
  feedback?: string;
}

export interface SseEmitter {
  /** @format int64 */
  timeout?: number;
}

/** 알림 설정 업데이트 요청 */
export interface NotificationInfoReq {
  /**
   * Streak 알림 수신 동의 여부
   * @example true
   */
  streak?: boolean;
}

export interface Response {
  /** @format int32 */
  status?: number;
  code?: string;
  message?: string;
  data?: object;
}

/** FCM 토큰 등록 요청 */
export interface FcmRegisterReq {
  /**
   * Firebase Cloud Messaging 토큰
   * @example "dGhpcyBpcyBhIGZha2UgZmNtIHRva2VuLi4u"
   */
  token?: string;
  /**
   * 운영체제 타입
   * @example "IOS"
   */
  osType?: FcmRegisterReqOsTypeEnum;
  /**
   * 기기 고유 식별자 (OS별 고유 ID)
   * @example "A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6"
   */
  osId?: string;
}

export interface CursorBaseReviewRes {
  items?: ReviewItemDto[];
  hasNext?: boolean;
  nextCursor?: string;
}

export interface ResponseCursorBaseReviewRes {
  /** @format int32 */
  status?: number;
  code?: string;
  message?: string;
  data?: CursorBaseReviewRes;
}

export interface ReviewItemDto {
  feedbackType?: ReviewItemDtoFeedbackTypeEnum;
  body?: string;
  /** @format date */
  reviewDate?: string;
}

export interface InquiryMonthRes {
  /** @format int32 */
  day?: number;
  feedbackType?: InquiryMonthResFeedbackTypeEnum;
}

export interface ResponseListInquiryMonthRes {
  /** @format int32 */
  status?: number;
  code?: string;
  message?: string;
  data?: InquiryMonthRes[];
}

export interface InquiryDayRes {
  body?: string;
  feedback?: string;
  /** @format date */
  date?: string;
}

export interface ResponseInquiryDayRes {
  /** @format int32 */
  status?: number;
  code?: string;
  message?: string;
  data?: InquiryDayRes;
}

export interface ResponseVoid {
  /** @format int32 */
  status?: number;
  code?: string;
  message?: string;
  data?: object;
}

export enum SaveReqTypeEnum {
  FEELING = "FEELING",
  THINKING = "THINKING",
}

/**
 * 운영체제 타입
 * @example "IOS"
 */
export enum FcmRegisterReqOsTypeEnum {
  WINDOW = "WINDOW",
  IOS = "IOS",
  ANDROID = "ANDROID",
  MAC = "MAC",
  IOS1 = "IOS",
  ANDROID2 = "ANDROID",
}

export enum ReviewItemDtoFeedbackTypeEnum {
  FEELING = "FEELING",
  THINKING = "THINKING",
}

export enum InquiryMonthResFeedbackTypeEnum {
  FEELING = "FEELING",
  THINKING = "THINKING",
}

export namespace SemiUserController {
  /**
   * @description streak이 등록되지 않은 semi-user의 streak 등록 기능
   * @tags semi-user-controller
   * @name RegisterStreak
   * @summary semi-user streak 등록
   * @request PUT:/auth/semi/streak
   * @secure
   * @response `200` `ResponseTokenDto` OK
   */
  export namespace RegisterStreak {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = StreakReq;
    export type RequestHeaders = {};
    export type ResponseBody = ResponseTokenDto;
  }
}

export namespace AuthController {
  /**
   * No description
   * @tags auth-controller
   * @name RegisterUser
   * @request POST:/user/register
   * @secure
   * @response `200` `ResponseAuthRes` OK
   */
  export namespace RegisterUser {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RegisterReq;
    export type RequestHeaders = {};
    export type ResponseBody = ResponseAuthRes;
  }

  /**
   * @description os_id를 통해 로그인을 합니다. 성공시 AT/RT를 반환합니다.
   * @tags auth-controller
   * @name Login
   * @summary 유저 로그인
   * @request POST:/user/login
   * @secure
   * @response `200` `ResponseAuthRes` 로그인 성공
   * @response `404` `ResponseAuthRes` 로그인 실패 실패(os_id에 대한 유저 미확인)
   */
  export namespace Login {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginReq;
    export type RequestHeaders = {};
    export type ResponseBody = ResponseAuthRes;
  }

  /**
   * No description
   * @tags auth-controller
   * @name Reissue
   * @request GET:/user/reissue
   * @secure
   * @response `200` `ResponseTokenDto` OK
   */
  export namespace Reissue {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {
      "Refresh-Token": string;
    };
    export type ResponseBody = ResponseTokenDto;
  }

  /**
   * No description
   * @tags auth-controller
   * @name Okok
   * @request GET:/auth/user/isthiswork
   * @secure
   * @response `200` `Response` OK
   */
  export namespace Okok {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Response;
  }

  /**
   * No description
   * @tags auth-controller
   * @name Delete
   * @request DELETE:/auth/user/delete
   * @secure
   * @response `200` `ResponseVoid` OK
   */
  export namespace Delete {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResponseVoid;
  }
}

export namespace ReviewController {
  /**
   * @description 사용자의 리뷰가 요청 날짜를 포함하여 오름차순(최신순)으로 10개 응답, 다음 데이터가 있다면 hasNext=true, nextCursor=YYYY-MM-DD
   * @tags review-controller
   * @name List
   * @summary 사용자 리뷰 커서기반 최신순 조회
   * @request GET:/auth/user/review
   * @secure
   * @response `200` `ResponseCursorBaseReviewRes` OK
   */
  export namespace List {
    export type RequestParams = {};
    export type RequestQuery = {
      after?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResponseCursorBaseReviewRes;
  }

  /**
   * No description
   * @tags review-controller
   * @name SaveReview
   * @request POST:/auth/user/review
   * @secure
   * @response `200` `object` OK
   */
  export namespace SaveReview {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SaveReq;
    export type RequestHeaders = {};
    export type ResponseBody = object;
  }

  /**
   * No description
   * @tags review-controller
   * @name InquiryMonth
   * @request GET:/auth/user/api/review/inquiry/month
   * @secure
   * @response `200` `ResponseListInquiryMonthRes` OK
   */
  export namespace InquiryMonth {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @format int32 */
      year: number;
      /** @format int32 */
      month: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResponseListInquiryMonthRes;
  }

  /**
   * No description
   * @tags review-controller
   * @name InquiryDate
   * @request GET:/auth/user/api/review/inquiry/day
   * @secure
   * @response `200` `ResponseInquiryDayRes` OK
   */
  export namespace InquiryDate {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @format int32 */
      year: number;
      /** @format int32 */
      month: number;
      /** @format int32 */
      day: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResponseInquiryDayRes;
  }
}

export namespace SoraController {
  /**
   * No description
   * @tags sora-controller
   * @name SubmitReview
   * @request POST:/auth/user/api/review/submit
   * @secure
   * @response `200` `SseEmitter` OK
   */
  export namespace SubmitReview {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = string;
    export type RequestHeaders = {};
    export type ResponseBody = SseEmitter;
  }
}

export namespace Notification {
  /**
   * @description 사용자의 알림 수신 동의 설정을 업데이트합니다. 현재는 Streak 알림 수신 여부만 지원합니다.
   * @tags Notification
   * @name UpdateNotification
   * @summary 알림 설정 업데이트
   * @request POST:/auth/notification
   * @secure
   * @response `200` `Response` 알림 설정 업데이트 성공
   * @response `400` `Response` 잘못된 요청
   * @response `401` `Response` 인증되지 않은 사용자
   */
  export namespace UpdateNotification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NotificationInfoReq;
    export type RequestHeaders = {};
    export type ResponseBody = Response;
  }

  /**
   * @description 기기별 FCM 토큰을 등록합니다. 이미 등록된 기기(osId)의 경우 토큰을 업데이트합니다.
   * @tags Notification
   * @name RegisterFcmToken
   * @summary FCM 토큰 등록
   * @request POST:/auth/notification/token
   * @secure
   * @response `200` `Response` FCM 토큰 등록 성공
   * @response `400` `Response` 잘못된 요청
   * @response `404` `Response` 등록되지 않은 기기 ID
   */
  export namespace RegisterFcmToken {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FcmRegisterReq;
    export type RequestHeaders = {};
    export type ResponseBody = Response;
  }
}

export namespace StreamTestController {
  /**
   * No description
   * @tags stream-test-controller
   * @name TestMvcStream
   * @summary review test
   * @request GET:/test/stream/mvc
   * @secure
   * @response `200` `SseEmitter` OK
   */
  export namespace TestMvcStream {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * @format int32
       * @default 300
       */
      tokenCount?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SseEmitter;
  }

  /**
   * No description
   * @tags stream-test-controller
   * @name TestMvcInstantStream
   * @request GET:/test/stream/mvc/instant
   * @secure
   * @response `200` `SseEmitter` OK
   */
  export namespace TestMvcInstantStream {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * @format int32
       * @default 300
       */
      tokenCount?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SseEmitter;
  }
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://test.magicofconch.my";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

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
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title MagicOfConch API
 * @version v1.0.0
 * @baseUrl http://test.magicofconch.my
 *
 * 소라의 조언 - 사용자 API 문서
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  semiUserController = {
    /**
     * @description streak이 등록되지 않은 semi-user의 streak 등록 기능
     *
     * @tags semi-user-controller
     * @name RegisterStreak
     * @summary semi-user streak 등록
     * @request PUT:/auth/semi/streak
     * @secure
     * @response `200` `ResponseTokenDto` OK
     */
    registerStreak: (data: StreakReq, params: RequestParams = {}) =>
      this.request<ResponseTokenDto, any>({
        path: `/auth/semi/streak`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  authController = {
    /**
     * No description
     *
     * @tags auth-controller
     * @name RegisterUser
     * @request POST:/user/register
     * @secure
     * @response `200` `ResponseAuthRes` OK
     */
    registerUser: (data: RegisterReq, params: RequestParams = {}) =>
      this.request<ResponseAuthRes, any>({
        path: `/user/register`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description os_id를 통해 로그인을 합니다. 성공시 AT/RT를 반환합니다.
     *
     * @tags auth-controller
     * @name Login
     * @summary 유저 로그인
     * @request POST:/user/login
     * @secure
     * @response `200` `ResponseAuthRes` 로그인 성공
     * @response `404` `ResponseAuthRes` 로그인 실패 실패(os_id에 대한 유저 미확인)
     */
    login: (data: LoginReq, params: RequestParams = {}) =>
      this.request<ResponseAuthRes, ResponseAuthRes>({
        path: `/user/login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Reissue
     * @request GET:/user/reissue
     * @secure
     * @response `200` `ResponseTokenDto` OK
     */
    reissue: (params: RequestParams = {}) =>
      this.request<ResponseTokenDto, any>({
        path: `/user/reissue`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Okok
     * @request GET:/auth/user/isthiswork
     * @secure
     * @response `200` `Response` OK
     */
    okok: (params: RequestParams = {}) =>
      this.request<Response, any>({
        path: `/auth/user/isthiswork`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Delete
     * @request DELETE:/auth/user/delete
     * @secure
     * @response `200` `ResponseVoid` OK
     */
    delete: (params: RequestParams = {}) =>
      this.request<ResponseVoid, any>({
        path: `/auth/user/delete`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  reviewController = {
    /**
     * @description 사용자의 리뷰가 요청 날짜를 포함하여 오름차순(최신순)으로 10개 응답, 다음 데이터가 있다면 hasNext=true, nextCursor=YYYY-MM-DD
     *
     * @tags review-controller
     * @name List
     * @summary 사용자 리뷰 커서기반 최신순 조회
     * @request GET:/auth/user/review
     * @secure
     * @response `200` `ResponseCursorBaseReviewRes` OK
     */
    list: (
      query?: {
        after?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseCursorBaseReviewRes, any>({
        path: `/auth/user/review`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags review-controller
     * @name SaveReview
     * @request POST:/auth/user/review
     * @secure
     * @response `200` `object` OK
     */
    saveReview: (data: SaveReq, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/auth/user/review`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags review-controller
     * @name InquiryMonth
     * @request GET:/auth/user/api/review/inquiry/month
     * @secure
     * @response `200` `ResponseListInquiryMonthRes` OK
     */
    inquiryMonth: (
      query: {
        /** @format int32 */
        year: number;
        /** @format int32 */
        month: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseListInquiryMonthRes, any>({
        path: `/auth/user/api/review/inquiry/month`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags review-controller
     * @name InquiryDate
     * @request GET:/auth/user/api/review/inquiry/day
     * @secure
     * @response `200` `ResponseInquiryDayRes` OK
     */
    inquiryDate: (
      query: {
        /** @format int32 */
        year: number;
        /** @format int32 */
        month: number;
        /** @format int32 */
        day: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseInquiryDayRes, any>({
        path: `/auth/user/api/review/inquiry/day`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  soraController = {
    /**
     * No description
     *
     * @tags sora-controller
     * @name SubmitReview
     * @request POST:/auth/user/api/review/submit
     * @secure
     * @response `200` `SseEmitter` OK
     */
    submitReview: (data: string, params: RequestParams = {}) =>
      this.request<SseEmitter, any>({
        path: `/auth/user/api/review/submit`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Text,
        ...params,
      }),
  };
  notification = {
    /**
     * @description 사용자의 알림 수신 동의 설정을 업데이트합니다. 현재는 Streak 알림 수신 여부만 지원합니다.
     *
     * @tags Notification
     * @name UpdateNotification
     * @summary 알림 설정 업데이트
     * @request POST:/auth/notification
     * @secure
     * @response `200` `Response` 알림 설정 업데이트 성공
     * @response `400` `Response` 잘못된 요청
     * @response `401` `Response` 인증되지 않은 사용자
     */
    updateNotification: (
      data: NotificationInfoReq,
      params: RequestParams = {},
    ) =>
      this.request<Response, Response>({
        path: `/auth/notification`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 기기별 FCM 토큰을 등록합니다. 이미 등록된 기기(osId)의 경우 토큰을 업데이트합니다.
     *
     * @tags Notification
     * @name RegisterFcmToken
     * @summary FCM 토큰 등록
     * @request POST:/auth/notification/token
     * @secure
     * @response `200` `Response` FCM 토큰 등록 성공
     * @response `400` `Response` 잘못된 요청
     * @response `404` `Response` 등록되지 않은 기기 ID
     */
    registerFcmToken: (data: FcmRegisterReq, params: RequestParams = {}) =>
      this.request<Response, Response>({
        path: `/auth/notification/token`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  streamTestController = {
    /**
     * No description
     *
     * @tags stream-test-controller
     * @name TestMvcStream
     * @summary review test
     * @request GET:/test/stream/mvc
     * @secure
     * @response `200` `SseEmitter` OK
     */
    testMvcStream: (
      query?: {
        /**
         * @format int32
         * @default 300
         */
        tokenCount?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SseEmitter, any>({
        path: `/test/stream/mvc`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags stream-test-controller
     * @name TestMvcInstantStream
     * @request GET:/test/stream/mvc/instant
     * @secure
     * @response `200` `SseEmitter` OK
     */
    testMvcInstantStream: (
      query?: {
        /**
         * @format int32
         * @default 300
         */
        tokenCount?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SseEmitter, any>({
        path: `/test/stream/mvc/instant`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
}
