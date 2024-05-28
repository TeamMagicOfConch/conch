import { SafeAreaView, View } from 'react-native'
import { Slot } from 'expo-router'
import { Colors } from '@/assets/colors'
import { ReviewDateNavbar, ViewWithDefaultBackgroundColor } from '@/components'

export default function ReviewLayout() {
  return (
    <ViewWithDefaultBackgroundColor>
      <ReviewDateNavbar />
      <Slot />
    </ViewWithDefaultBackgroundColor>
  )
}
