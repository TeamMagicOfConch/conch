import AsyncStorage from '@react-native-async-storage/async-storage'
import { createConchSwaggerClient, createConchAuthHelpers, createConchReviewHelpers } from '@api/conch'

export const conch = createConchSwaggerClient(process.env.EXPO_PUBLIC_API_URL as string)
export const { setTokens, login, register, registerOnboarding, refreshToken } = createConchAuthHelpers({
  storage: AsyncStorage,
  swaggerClient: conch,
})

export const { save, inquiryMonth, inquiryDate, testSecurity, submitStreaming } = createConchReviewHelpers({
  swaggerClient: conch,
  storage: AsyncStorage,
  login,
  refreshToken,
})
