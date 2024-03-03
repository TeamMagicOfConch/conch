import React from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import SafeAreaViewWithBg from '@/components/SafeAreaViewWithBg'
import { Text, Button } from 'react-native'
import { useLogin } from '@/hooks'
import type { ReviewStackRouteProp, RootStackNavigationProp } from '@/types/navigation'

export default function ViewReviewScreen() {
  const { userId } = useLogin()
  const { params } = useRoute<ReviewStackRouteProp>()
  const { date } = params
  const navigation = useNavigation<RootStackNavigationProp>()

  return (
    <SafeAreaViewWithBg>
      <Text>WriteReview: {date}</Text>
      <Button
        title="back"
        onPress={() => navigation.goBack()}
      />
    </SafeAreaViewWithBg>
  )
}
