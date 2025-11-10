import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { createConchSwaggerClient, createConchAuthHelpers, createConchReviewHelpers } from '@api/conch'
import { consts } from './consts'

export const conch = createConchSwaggerClient(process.env.EXPO_PUBLIC_API_URL as string)
export const { setTokens, login, register, registerOnboarding, refreshToken } = createConchAuthHelpers({
  storage: AsyncStorage,
  swaggerClient: conch,
  getDeviceId: async () => DeviceInfo.getUniqueId(),
  getPlatformOS: () => Platform.OS.toUpperCase(),
  accessTokenKey: consts.asyncStorageKey.accessToken,
  refreshTokenKey: consts.asyncStorageKey.refreshToken,
  usernameKey: consts.asyncStorageKey.username,
})

export const { save, list, inquiryMonth, inquiryDate, testSecurity, submitStreaming } = createConchReviewHelpers({
  swaggerClient: conch,
  storage: AsyncStorage,
  login,
  refreshToken,
  accessTokenKey: consts.asyncStorageKey.accessToken,
})
