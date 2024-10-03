import React from 'react'
import { Text, ScrollView, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Colors } from '@/assets/colors'
import { SoraResponseMenu } from '@/components'
import { useReviewData } from './hooks'

export default function ViewReviewScreen() {
  const { review } = useReviewData()
  const { body, responseType, responseBody } = review || {}
  const isFeeling = responseType === 'feeling'
  const backgroundColor = isFeeling ? Colors.darkGodong : Colors.darkSora

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bgGrey }}>
      <ScrollView style={style.scrollView}>
        <Text style={style.body}>{body}</Text>
      </ScrollView>
      <SoraResponseMenu
        responseType={responseType}
        responseBody={responseBody}
      />
    </GestureHandlerRootView>
  )
}

const style = StyleSheet.create({
  scrollView: {
    paddingHorizontal: '9%',
    marginBottom: '20%',
    alignSelf: 'center',
  },
  body: {
    fontSize: 14,
    color: Colors.writtenGrey,
    lineHeight: 30,
  },
})
