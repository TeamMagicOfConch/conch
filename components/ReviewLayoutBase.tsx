import { SafeAreaView, View } from 'react-native'
import { Slot } from 'expo-router'
import { ReviewDateNavbar, ViewWithDefaultBackgroundColor } from '@/components'
import { Colors } from '@/assets/colors'

export default function ReviewLayoutBase() {
  return (
    <ViewWithDefaultBackgroundColor>
      <ReviewDateNavbar />
      <Slot />
    </ViewWithDefaultBackgroundColor>
  )
}
