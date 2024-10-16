import { FeedbackType } from '@/utils/api/review/types'

interface Consts {
  reviewType: {
    [key: string]: FeedbackType
  }
  asyncStorageKey: {
    [key: string]: string
  }
  tokenDuration: number
  [key: string]: any
}

export const consts: Consts = {
  reviewType: {
    thinking: 'THINKING',
    feeling: 'FEELING',
  },
  asyncStorageKey: {
    osId: 'magicOfConchOsId',
    accessToken: 'magicOfConchAccessToken',
    refreshToken: 'magicOfConchRefreshToken',
  },
  tokenDuration: 1000 * 60 * 5, // 5분
}
