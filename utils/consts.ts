import { Review } from '@/types/review'

interface Consts {
  reviewType: {
    [key: string]: Review['responseType']
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
    tokenExpiresAt: 'magicOfConchTokenExpire',
  },
  tokenDuration: 1000 * 60 * 5, // 5분
}
