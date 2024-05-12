import { useState } from 'react'
import { View } from 'react-native'
import { Keyboard, TextInput, TouchableWithoutFeedback } from 'react-native'
import ReviewScreensNavBar from '@/components/ReviewScreensNavBar'
import { Colors } from '@/assets/colors'
import { ReviewSubmitFooter } from './components'

const PLACEHOLDER = '어떤 일이 있었나요? 무슨 느낌이나 생각이 들었나요?\n*하루에 한 번, 손잡이를 원하는 방향으로 잡아당겨 소라의 답변을 들을 수 있어요.'

export default function WriteReviewScreen() {
  const [review, setReview] = useState('')

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgGrey }}>
      <ReviewScreensNavBar />
      <TextInput
        blurOnSubmit
        onSubmitEditing={Keyboard.dismiss}
        multiline
        placeholder={PLACEHOLDER}
        placeholderTextColor={Colors.lightGrey}
        value={review}
        onChangeText={setReview}
        style={{
          textAlignVertical: 'top',
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 100,
          fontSize: 14,
          lineHeight: 30,
        }}
      />
      <ReviewSubmitFooter review={review} />
    </View>
  )
}
