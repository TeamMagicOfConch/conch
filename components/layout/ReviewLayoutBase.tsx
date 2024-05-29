import { SafeAreaView, View } from 'react-native'
import { Slot } from 'expo-router'
import { ViewWithDefaultBackgroundColor } from './view'
import { ReviewScreensNavbar } from './navbar'
import { Colors } from '@/assets/colors'

export default function ReviewLayoutBase() {
  return (
    <ViewWithDefaultBackgroundColor>
      <ReviewScreensNavbar />
      <Slot />
    </ViewWithDefaultBackgroundColor>
  )
}
