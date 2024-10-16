import { useRouter } from 'expo-router'
import { Text, StyleSheet, Pressable } from 'react-native'
import { Colors } from '@/assets/colors'
import { getToday } from '@/utils'
import { useReviewDataAtMonth } from '../hooks'

const BUTTON_NOT_WRITTEN_TEXT = '오늘 있던 일 소라에게 들려주기'
const BUTTON_WRITTEN_TEXT = '오늘 소라가 해준 말 다시 보기'

export default function ReviewButton({ isTodayReviewWritten }: { isTodayReviewWritten: boolean }) {
  const router = useRouter()
  const { year, month, date: todayDate } = getToday()
  const { reviews } = useReviewDataAtMonth({ year, month: month + 1 })
  const targetScreen = isTodayReviewWritten ? '/review' : '/new-review'
  const buttonTitle = isTodayReviewWritten ? BUTTON_WRITTEN_TEXT : BUTTON_NOT_WRITTEN_TEXT
  const date = `${year}-${month}-${todayDate}`

  const { feedbackType } = reviews?.find((review) => review.day === todayDate) || {}

  return (
    <Pressable
      style={style.button}
      onPress={() => router.push({ pathname: targetScreen, params: { date, feedbackType } })}
    >
      <Text style={style.text}>{buttonTitle}</Text>
    </Pressable>
  )
}

const style = StyleSheet.create({
  button: {
    width: '66.66%',
    height: '5.69%',

    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '23.3%',

    borderRadius: 50,
    backgroundColor: Colors.writtenGrey,

    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    fontWeight: 'bold',
    color: Colors.white,
  },
})
