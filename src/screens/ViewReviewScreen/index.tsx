import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import SafeAreaViewWithBg from '@components/SafeAreaViewWithBg'
import { Text, ScrollView, StyleSheet } from 'react-native'
import ReviewScreensNavBar from '@/components/ReviewScreensNavBar'
import { Colors } from '@/assets/colors'
import SoraReponseMenu from './SoraReponseMenu'
import { useReviewData } from './hooks'

export default function ViewReviewScreen() {
  const { review } = useReviewData()
  const { body, responseType, responseBody } = review || {}

  return (
    <SafeAreaViewWithBg>
      <GestureHandlerRootView>
        <ReviewScreensNavBar />
        <ScrollView style={style.scrollView}>
          <Text style={style.body}>{body}</Text>
        </ScrollView>
        <SoraReponseMenu
          responseType={responseType}
          responseBody={responseBody}
        />
      </GestureHandlerRootView>
    </SafeAreaViewWithBg>
  )
}

const style = StyleSheet.create({
  scrollView: {
    width: '82%',
    alignSelf: 'center',
  },
  body: {
    fontSize: 14,
    color: Colors.writtenGrey,
    lineHeight: 30,
  },
})
