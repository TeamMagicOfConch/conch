import React from 'react'
import SafeAreaViewWithBg from '@components/SafeAreaViewWithBg'
import { Text, ScrollView } from 'react-native'
import ReviewScreensNavBar from '@/components/ReviewScreensNavBar'
import { Colors } from '@/assets/colors'
import { useReviewData } from './hooks'

export default function ViewReviewScreen() {
  const { review } = useReviewData()
  const { body, responseType, responseBody } = review || {}

  return (
    <SafeAreaViewWithBg>
      <ReviewScreensNavBar />
      <ScrollView style={{ width: '82%', alignSelf: 'center' }}>
        <Text style={{ fontSize: 14, color: Colors.writtenGrey, lineHeight: 30 }}>{body}</Text>
      </ScrollView>
    </SafeAreaViewWithBg>
  )
}
