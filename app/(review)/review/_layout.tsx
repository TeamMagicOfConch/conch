import { SafeAreaView, View } from 'react-native'
import { Slot } from 'expo-router'
import { useReviewData } from './hooks'
import { SafeAreaViewWithDefaultBackgroundColor, ReviewLayoutBase } from '@/components'
import { Colors } from '@/assets/colors'

export default function ReviewLayout() {
  const { review } = useReviewData()
  const { body, responseType, responseBody } = review || {}
  const isFeeling = responseType === 'feeling'
  const backgroundColor = isFeeling ? Colors.fSoraBg : Colors.tSoraBg

  return <ReviewLayoutBase backgroundColor={backgroundColor} />
}
