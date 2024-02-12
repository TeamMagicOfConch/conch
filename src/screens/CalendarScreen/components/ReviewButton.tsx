import React from 'react'
import { useNavigation } from '@react-navigation/native'
import type { RootStackNavigationProp } from '@/types/navigation'
import { Button } from 'react-native'

const BUTTON_NOT_WRITTEN_TEXT = '오늘 있었던 일 소라에게 들려주기'
const BUTTON_WRITTEN_TEXT = '오늘 소라가 해준 말 다시 보기'

export default function ReviewButton({ isTodayReviewWritten }: { isTodayReviewWritten: boolean }) {
  const navigation = useNavigation<RootStackNavigationProp>()
  const targetScreen = isTodayReviewWritten ? 'Review' : 'WriteReview'
  const buttonTitle = isTodayReviewWritten ? BUTTON_WRITTEN_TEXT : BUTTON_NOT_WRITTEN_TEXT

  return (
    <Button
      title={buttonTitle}
      onPress={() => navigation.navigate('Review', { date: 'test' })}
    />
  )
}
