import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { authAxios, onRequest, onRequestError, onResponse, onResponseError } from './auth'
import { CommonResponse, AuthToken, ReviewSubmitRequestBody } from './types'

export const reviewAxios = axios.create({ baseURL: `${authAxios.defaults.baseURL}/auth/user/api/review` })
reviewAxios.interceptors.request.use(onRequest, onRequestError)
reviewAxios.interceptors.response.use(onResponse, onResponseError)

export async function reviewGet(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<CommonResponse<AuthToken>>> {
  return reviewAxios.get(url, config)
}
export async function reviewPost(
  url: string,
  body: ReviewSubmitRequestBody,
  config?: AxiosRequestConfig<ReviewSubmitRequestBody>,
): Promise<AxiosResponse<CommonResponse<AuthToken>>> {
  return reviewAxios.post(url, body, config)
}
