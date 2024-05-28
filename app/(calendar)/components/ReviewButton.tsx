import { useRouter } from 'expo-router'
import { Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import { Colors } from '@/assets/colors'
import { getToday } from '@/utils'

const BUTTON_NOT_WRITTEN_TEXT = '오늘 있던 일 소라에게 들려주기'
const BUTTON_WRITTEN_TEXT = '오늘 소라가 해준 말 다시 보기'

export default function ReviewButton({ isTodayReviewWritten }: { isTodayReviewWritten: boolean }) {
  const router = useRouter()
  const targetScreen = isTodayReviewWritten ? '/review' : '/new-review'
  const buttonTitle = isTodayReviewWritten ? BUTTON_WRITTEN_TEXT : BUTTON_NOT_WRITTEN_TEXT
  const { year, month, date: todayDate } = getToday()
  const date = `${year}-${month}-${todayDate}`

  return (
    <Pressable
      style={style.button}
      onPress={() => router.push({ pathname: targetScreen, params: { date } })}
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
