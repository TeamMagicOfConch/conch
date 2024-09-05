import { Pressable, Keyboard, TextInput, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Colors } from '@/assets/colors'
import { ReviewSubmitFooter } from './components'
import { useReviewContext } from './context'
import SoraReponseMenu from '@/components/common/SoraReponseMenu'
import { useOpenAIStream } from '@/hooks'
import { ReviewScreensNavbar } from '@/components'

const PLACEHOLDER = '어떤 일이 있었나요? 무슨 느낌이나 생각이 들었나요?\n*하루에 한 번, 손잡이를 원하는 방향으로 잡아당겨 소라의 답변을 들을 수 있어요.'

export default function WriteReviewScreen() {
  const reviewContext = useReviewContext()
  const { response = '', loading, error } = useOpenAIStream(reviewContext?.review) || {}
  if (!reviewContext) return null
  const { review, setReview } = reviewContext
  const reviewSubmitted = !!review.responseType

  function setReviewBody(reviewBody: string) {
    setReview((prev) => ({
      ...prev,
      body: reviewBody,
    }))
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bgGrey }}>
      <ReviewScreensNavbar />
      <Pressable
        style={{ flex: 1 }}
        onPress={Keyboard.dismiss}
      >
        <TextInput
          editable={!reviewSubmitted}
          multiline
          placeholder={PLACEHOLDER}
          placeholderTextColor={Colors.lightGrey}
          value={review.body}
          onChangeText={setReviewBody}
          style={style.textInput}
        />
      </Pressable>
      {reviewSubmitted ? (
        <SoraReponseMenu
          responseType={review.responseType}
          responseBody={response}
          loading={loading}
          error={error}
        />
      ) : (
        <ReviewSubmitFooter />
      )}
    </GestureHandlerRootView>
  )
}

const style = StyleSheet.create({
  textInput: {
    textAlignVertical: 'top',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 100,
    fontSize: 14,
    lineHeight: 30,
  },
})
