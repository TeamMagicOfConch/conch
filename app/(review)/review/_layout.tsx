import { SafeAreaView, View } from 'react-native'
import { Slot } from 'expo-router'
import { useReviewData } from './hooks'
import { ReviewDateNavbar, SafeAreaViewWithDefaultBackgroundColor, ReviewLayoutBase } from '@/components'
import { Colors } from '@/assets/colors'

export default function ReviewLayout() {
  const { review } = useReviewData()
  const { body, responseType, responseBody } = review || {}
  const isFeeling = responseType === 'feeling'
  const backgroundColor = isFeeling ? Colors.darkGodong : Colors.darkSora

  return (
    <>
      <SafeAreaViewWithDefaultBackgroundColor style={{ flex: 0 }} />
      <SafeAreaViewWithDefaultBackgroundColor style={{ flex: 1, backgroundColor }}>
        <ReviewLayoutBase />
      </SafeAreaViewWithDefaultBackgroundColor>
    </>
  )
}
