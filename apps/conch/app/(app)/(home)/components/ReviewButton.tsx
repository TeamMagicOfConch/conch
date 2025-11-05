import { useRouter } from 'expo-router'
import { getToday } from '@conch/utils'
import { PrimaryButton } from '@conch/components'
import { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { ReviewForCalendar } from '../types'

const BUTTON_NOT_WRITTEN_TEXT = '오늘 있던 일 소라에게 들려주기'
const BUTTON_WRITTEN_TEXT = '오늘 소라가 해준 말 다시 보기'

export default function ReviewButton({ todayReview }: { todayReview?: ReviewForCalendar }) {
  const router = useRouter()
  const { year, month, date: todayDate } = useMemo(() => getToday(), [])
  const isTodayReviewWritten = !!todayReview
  const targetScreen = isTodayReviewWritten ? '/review' : '/new-review'
  const buttonTitle = isTodayReviewWritten ? BUTTON_WRITTEN_TEXT : BUTTON_NOT_WRITTEN_TEXT
  const date = `${year}-${month}-${todayDate}`

  const { feedbackType } = todayReview || {}
  const onPress = () => router.push({ pathname: targetScreen, params: { date, feedbackType } })

  return (
    <View style={style.container}>
      <PrimaryButton onPress={onPress}>
        {buttonTitle}
      </PrimaryButton>
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '15%',
    alignItems: 'center',
  },
})

