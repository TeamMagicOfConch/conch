import { SafeAreaView, View } from 'react-native'
import { Slot } from 'expo-router'
import { SafeAreaViewWithDefaultBackgroundColor, ReviewLayoutBase } from '@/components'
import { Colors } from '@/assets/colors'

export default function ReviewLayout() {
  return (
    <SafeAreaViewWithDefaultBackgroundColor>
      <ReviewLayoutBase />
    </SafeAreaViewWithDefaultBackgroundColor>
  )
}
