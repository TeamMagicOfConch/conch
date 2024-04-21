import React, { useState } from 'react'
import SafeAreaViewWithBg from '@components/SafeAreaViewWithBg'
import { TextInput } from 'react-native'
import ReviewScreensNavBar from '@/components/ReviewScreensNavBar'
import { Colors } from '@/assets/colors'
import { ReviewSubmitFooter } from './components'

const PLACEHOLDER = '어떤 일이 있었나요? 무슨 느낌이나 생각이 들었나요?\n*하루에 한 번, 손잡이를 원하는 방향으로 잡아당겨 소라의 답변을 들을 수 있어요.'

export default function WriteReviewScreen() {
  const [review, setReview] = useState('')

  return (
    <SafeAreaViewWithBg>
      <ReviewScreensNavBar />
      <TextInput
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
    </SafeAreaViewWithBg>
  )
}
