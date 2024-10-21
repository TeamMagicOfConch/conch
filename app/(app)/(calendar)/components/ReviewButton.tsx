import { useRouter } from 'expo-router'
import { getToday } from '@/utils'
import { PrimaryButton } from '@/components'
import { ReviewForCalendar } from '../types'

const BUTTON_NOT_WRITTEN_TEXT = '오늘 있던 일 소라에게 들려주기'
const BUTTON_WRITTEN_TEXT = '오늘 소라가 해준 말 다시 보기'

export default function ReviewButton({ todayReview }: { todayReview?: ReviewForCalendar }) {
  const router = useRouter()
  const { year, month, date: todayDate } = getToday()
  const isTodayReviewWritten = !!todayReview
  const targetScreen = isTodayReviewWritten ? '/review' : '/new-review'
  const buttonTitle = isTodayReviewWritten ? BUTTON_WRITTEN_TEXT : BUTTON_NOT_WRITTEN_TEXT
  const date = `${year}-${month}-${todayDate}`

  const { feedbackType } = todayReview || {}
  console.log(feedbackType)
  const onPress = () => router.push({ pathname: targetScreen, params: { date, feedbackType } })

  return (
    <PrimaryButton
      style={{
        position: 'absolute',
        bottom: '23.3%',
      }}
      onPress={onPress}
    >
      {buttonTitle}
    </PrimaryButton>
  )
}
