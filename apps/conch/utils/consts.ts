export const consts = {
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
} as const
