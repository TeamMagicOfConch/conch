import { useState, useEffect } from 'react'
import { ScrollView, TextInput, StyleSheet, Keyboard, useWindowDimensions } from 'react-native'
import SoraReponseMenu from '@/components/common/SoraReponseMenu'
import { Colors } from '@/assets/colors'
import { useOpenAIStream } from '@/hooks'
import { useReviewContext } from './context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const PLACEHOLDER =
  '오늘은 어떤 일이 있었나요?\n무슨 느낌이나 생각이 들었나요?\n(1000자 이내)\n\n*하루에 한 번, 손잡이를 원하는 방향으로 잡아당겨 소라의 답변을 들을 수 있어요.'

export default function WriteReviewScreen() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const { height } = useWindowDimensions()
  const reviewContext = useReviewContext()
  const { response = '', loading, error } = useOpenAIStream(reviewContext?.review) || {}
  if (!reviewContext) return null
  const { review, setReview } = reviewContext
  const reviewSubmitted = !!review.responseType

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])
  function setReviewBody(reviewBody: string) {
    setReview((prev) => ({
      ...prev,
      body: reviewBody,
    }))
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, height: '85%', backgroundColor: Colors.bgGrey }}>
      <ScrollView contentContainerStyle={style.root}>
        <TextInput
          maxLength={1000}
          editable={!reviewSubmitted}
          multiline
          placeholder={PLACEHOLDER}
          placeholderTextColor={Colors.lightGrey}
          value={review.body}
          onChangeText={setReviewBody}
          style={[style.textInput, { maxHeight: height * 0.85 - keyboardHeight - 50 }]}
        />
      </ScrollView>
      {reviewSubmitted && (
        <SoraReponseMenu
          responseType={review.responseType}
          responseBody={response}
          loading={loading}
          error={error}
        />
      )}
    </GestureHandlerRootView>
  )
}

const style = StyleSheet.create({
  root: {
    width: '100%',
    height: '85%',
  },
  textInput: {
    width: '100%',
    textAlignVertical: 'top',
    paddingLeft: '7%',
    paddingRight: '7%',
    fontSize: 14,
    lineHeight: 30,
  },
})
