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
  adminName?: string;
  password?: string;
  email?: string;
}

export interface LoginRequest {
  adminName?: string;
  password?: string;
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
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Record<string, string>;
    export type RequestHeaders = {};
    export type ResponseBody = string;
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
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 조회 시작일 (yyyy-MM-dd)
       * @format date
       */
      startDate: string;
      /**
       * 조회 종료일 (yyyy-MM-dd)
       * @format date
       */
      endDate: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
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
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AdminSignUpForm;
    export type RequestHeaders = {};
    export type ResponseBody = object;
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
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginRequest;
    export type RequestHeaders = {};
    export type ResponseBody = object;
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
      baseURL: axiosConfig.baseURL || "http://admin.magicofconch.site",
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
 * @title MagicOfConch Admin API
 * @version v1.0.0
 * @baseUrl http://admin.magicofconch.site
 *
 * 소라 어드민에서 사용하는 API 문서입니다.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
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
        method: "POST",
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
        startDate: string;
        /**
         * 조회 종료일 (yyyy-MM-dd)
         * @format date
         */
        endDate: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/admin/review/export`,
        method: "GET",
        query: query,
        ...params,
      }),
  };
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
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
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
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
}
