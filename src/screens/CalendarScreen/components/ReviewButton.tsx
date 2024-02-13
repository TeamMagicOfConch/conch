import React from 'react'
import { useNavigation } from '@react-navigation/native'
import type { RootStackNavigationProp } from '@/types/navigation'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '@assets/colors'

const BUTTON_NOT_WRITTEN_TEXT = '오늘 있었던 일 소라에게 들려주기'
const BUTTON_WRITTEN_TEXT = '오늘 소라가 해준 말 다시 보기'

export default function ReviewButton({ isTodayReviewWritten }: { isTodayReviewWritten: boolean }) {
  const navigation = useNavigation<RootStackNavigationProp>()
  const targetScreen = isTodayReviewWritten ? 'Review' : 'WriteReview'
  const buttonTitle = isTodayReviewWritten ? BUTTON_WRITTEN_TEXT : BUTTON_NOT_WRITTEN_TEXT

  return (
    <TouchableOpacity
      style={style.button}
      onPress={() => navigation.navigate(targetScreen, { date: 'test' })}
    >
      <Text style={style.text}>{buttonTitle}</Text>
    </TouchableOpacity>
  )
}

const style = StyleSheet.create({
  button: {
    width: '70%',
    height: '10%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: Colors.writtenGrey,
  },
  text: {
    fontWeight: 'bold',
    color: Colors.white,
  },
})
