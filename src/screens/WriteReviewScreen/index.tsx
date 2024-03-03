import React from 'react'
import { useRoute } from '@react-navigation/native'
import SafeAreaViewWithBg from '@components/SafeAreaViewWithBg'
import { Text } from 'react-native'
import { useLogin } from '@/hooks'
import ReviewScreensNavBar from '@/components/ReviewScreensNavBar'
import type { ReviewStackRouteProp } from '@/types/navigation'

export default function ViewReviewScreen() {
  const { userId } = useLogin()
  const { params } = useRoute<ReviewStackRouteProp>()
  const { date } = params

  return (
    <SafeAreaViewWithBg>
      <ReviewScreensNavBar reviewDate={date} />
      <Text>
        {userId}님의 {date} 회고 쓰기
      </Text>
    </SafeAreaViewWithBg>
  )
}
