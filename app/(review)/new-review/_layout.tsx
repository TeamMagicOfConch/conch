import { SafeAreaView, View } from 'react-native'
import { Slot } from 'expo-router'
import { SafeAreaViewWithDefaultBackgroundColor, ReviewLayoutBase } from '@/components'
import { Colors } from '@/assets/colors'
import { ReviewContextProvider } from './context'

export default function ReviewLayout() {
  return (
    <ReviewContextProvider>
      <ReviewLayoutBase />
    </ReviewContextProvider>
  )
}
