import type { AxiosResponse } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getConchClient } from '../conchClient'
import { CommonResponse } from '../types'
import { ReviewQueryParam, RawReviewList } from './types'
import { consts } from '../../consts'
import { login, refreshToken } from '../auth'

const conch = getConchClient()

export async function reviewGet<T = RawReviewList>(
  url: string,
  params: ReviewQueryParam,
): Promise<AxiosResponse<CommonResponse<T>>> {
  const token = await AsyncStorage.getItem(consts.asyncStorageKey.accessToken)
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const request = async () => {
    if (url === '/month') {
      return conch.reviewController.inquiryMonth(
        { year: params.year, month: params.month! },
        { headers },
      )
    }
    if (url === '/day') {
      return conch.reviewController.inquiryDate(
        { year: params.year, month: params.month!, day: params.day! },
        { headers },
      )
    }
    throw new Error(`Unsupported reviewGet url: ${url}`)
  }

  try {
    // 1차 요청
    const first = await request()
    return first as unknown as AxiosResponse<CommonResponse<T>>
  } catch (e: any) {
    if (e?.response?.status === 401) {
      // refresh 후 재시도
      const rt = (await refreshToken())?.data?.accessToken
      if (rt) {
        const retry = await (url === '/month'
          ? conch.reviewController.inquiryMonth(
              { year: params.year, month: params.month! },
              { headers: { Authorization: `Bearer ${rt}` } },
            )
          : conch.reviewController.inquiryDate(
              { year: params.year, month: params.month!, day: params.day! },
              { headers: { Authorization: `Bearer ${rt}` } },
            ))
        return retry as unknown as AxiosResponse<CommonResponse<T>>
      }
      // login 후 최종 재시도
      const lt = (await login())?.data?.accessToken
      const retry = await (url === '/month'
        ? conch.reviewController.inquiryMonth(
            { year: params.year, month: params.month! },
            { headers: lt ? { Authorization: `Bearer ${lt}` } : {} },
          )
        : conch.reviewController.inquiryDate(
            { year: params.year, month: params.month!, day: params.day! },
            { headers: lt ? { Authorization: `Bearer ${lt}` } : {} },
          ))
      return retry as unknown as AxiosResponse<CommonResponse<T>>
    }
    throw e
  }
}
