import { SafeAreaView, View } from 'react-native'
import { Slot } from 'expo-router'
import ReviewDateNavbar from './ReviewScreensNavBar'
import ViewWithDefaultBackgroundColor from './ViewWithDefaultBackgroundColor'
import { Colors } from '@/assets/colors'

export default function ReviewLayoutBase() {
  return (
    <ViewWithDefaultBackgroundColor>
      <ReviewDateNavbar />
      <Slot />
    </ViewWithDefaultBackgroundColor>
  )
}
