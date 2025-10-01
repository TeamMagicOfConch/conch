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

export interface StreakReq {
  /** 
   * @minLength 1
   * @deprecated
   */
  reviewTime: string;
  reviewAt: string;
  /** @minLength 1 */
  writeLocation: string;
  /** @minLength 1 */
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
  osId?: string;
}

export interface SaveReq {
  body?: string;
  type?: "FEELING" | "THINKING";
  /** @format date */
  reviewDate?: string;
  feedback?: string;
}

export interface SseEmitter {
  /** @format int64 */
  timeout?: number;
}

export interface Response {
  /** @format int32 */
  status?: number;
  code?: string;
  message?: string;
  data?: any;
}

export interface InquiryMonthRes {
  /** @format int32 */
  day?: number;
  feedbackType?: "FEELING" | "THINKING";
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
  data?: any;
}

export namespace SemiUserController {
  /**
   * @description streak이 등록되지 않은 semi-user의 streak 등록 기능
   * @tags semi-user-controller
   * @name RegisterStreak
   * @summary semi-user streak 등록
   * @request PUT:/auth/semi/streak
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
   * No description
   * @tags auth-controller
   * @name Login
   * @request POST:/user/login
   * @response `200` `ResponseAuthRes` OK
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
   * No description
   * @tags review-controller
   * @name SaveReview
   * @request POST:/auth/user/review
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
   * @name SubmitReview
   * @request POST:/auth/user/api/review/submit
   * @response `200` `SseEmitter` OK
   */
  export namespace SubmitReview {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = string;
    export type RequestHeaders = {};
    export type ResponseBody = SseEmitter;
  }

  /**
   * No description
   * @tags review-controller
   * @name TestSecurity
   * @request GET:/auth/user/test/security
   * @response `200` `object` OK
   */
  export namespace TestSecurity {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = object;
  }

  /**
   * No description
   * @tags review-controller
   * @name InquiryMonth
   * @request GET:/auth/user/api/review/inquiry/month
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

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://test.magicofconch.site",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title OpenAPI definition
 * @version v0
 * @baseUrl http://test.magicofconch.site
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
     * @response `200` `ResponseTokenDto` OK
     */
    registerStreak: (data: StreakReq, params: RequestParams = {}) =>
      this.request<ResponseTokenDto, any>({
        path: `/auth/semi/streak`,
        method: "PUT",
        body: data,
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
     * @response `200` `ResponseAuthRes` OK
     */
    registerUser: (data: RegisterReq, params: RequestParams = {}) =>
      this.request<ResponseAuthRes, any>({
        path: `/user/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Login
     * @request POST:/user/login
     * @response `200` `ResponseAuthRes` OK
     */
    login: (data: LoginReq, params: RequestParams = {}) =>
      this.request<ResponseAuthRes, any>({
        path: `/user/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Reissue
     * @request GET:/user/reissue
     * @response `200` `ResponseTokenDto` OK
     */
    reissue: (params: RequestParams = {}) =>
      this.request<ResponseTokenDto, any>({
        path: `/user/reissue`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Okok
     * @request GET:/auth/user/isthiswork
     * @response `200` `Response` OK
     */
    okok: (params: RequestParams = {}) =>
      this.request<Response, any>({
        path: `/auth/user/isthiswork`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth-controller
     * @name Delete
     * @request DELETE:/auth/user/delete
     * @response `200` `ResponseVoid` OK
     */
    delete: (params: RequestParams = {}) =>
      this.request<ResponseVoid, any>({
        path: `/auth/user/delete`,
        method: "DELETE",
        ...params,
      }),
  };
  reviewController = {
    /**
     * No description
     *
     * @tags review-controller
     * @name SaveReview
     * @request POST:/auth/user/review
     * @response `200` `object` OK
     */
    saveReview: (data: SaveReq, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/auth/user/review`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags review-controller
     * @name SubmitReview
     * @request POST:/auth/user/api/review/submit
     * @response `200` `SseEmitter` OK
     */
    submitReview: (data: string, params: RequestParams = {}) =>
      this.request<SseEmitter, any>({
        path: `/auth/user/api/review/submit`,
        method: "POST",
        body: data,
        type: ContentType.Text,
        ...params,
      }),

    /**
     * No description
     *
     * @tags review-controller
     * @name TestSecurity
     * @request GET:/auth/user/test/security
     * @response `200` `object` OK
     */
    testSecurity: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/auth/user/test/security`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags review-controller
     * @name InquiryMonth
     * @request GET:/auth/user/api/review/inquiry/month
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
        ...params,
      }),

    /**
     * No description
     *
     * @tags review-controller
     * @name InquiryDate
     * @request GET:/auth/user/api/review/inquiry/day
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
        ...params,
      }),
  };
}
