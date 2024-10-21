import React from 'react'
import { Text, ScrollView, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Colors } from '@/assets/colors'
import { SoraResponseMenu } from '@/components'
import { useReviewData } from './hooks'

export default function ViewReviewScreen() {
  const { review } = useReviewData()
  const { body, feedbackType, feedback } = review || {}

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bgGrey }}>
      <ScrollView style={style.scrollView}>
        <Text style={style.body}>{body}</Text>
      </ScrollView>
      <SoraResponseMenu
        feedbackType={feedbackType}
        feedback={feedback}
      />
    </GestureHandlerRootView>
  )
}

const style = StyleSheet.create({
  scrollView: {
    paddingHorizontal: '9%',
    marginBottom: '20%',
  },
  body: {
    fontSize: 14,
    color: Colors.writtenGrey,
    lineHeight: 30,
  },
})
