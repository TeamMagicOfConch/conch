import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { authAxios, onRequest, onRequestError, onResponse, onResponseError } from '../auth'
import { CommonResponse } from '../types'
import { ReviewQueryParam, RawReviewList, RawReview } from './types'

export const reviewAxios = axios.create({ baseURL: `${authAxios.defaults.baseURL}/auth/user/api/review/inquiry` })
reviewAxios.interceptors.request.use(onRequest, onRequestError)
reviewAxios.interceptors.response.use(onResponse, onResponseError)

export async function reviewGet(
  url: string,
  params: ReviewQueryParam,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<CommonResponse<RawReview | RawReviewList>>> {
  const queryParam = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  return reviewAxios.get(`${url}?${queryParam}`, config)
}
