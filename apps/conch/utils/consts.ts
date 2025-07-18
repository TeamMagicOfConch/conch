import { FeedbackType } from '@conch/utils/api/review/types'

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
    username: 'magicOfConchUserName',
  },
  tokenDuration: 1000 * 60 * 5, // 5분
}
