import React from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import SafeAreaViewWithBg from '@components/SafeAreaViewWithBg'
import { Text, Button, StyleSheet } from 'react-native'
import { useLogin } from '@/hooks'
import type { ReviewStackRouteProp, RootStackNavigationProp } from '@/types/navigation'

export default function ViewReviewScreen() {
  const { userId } = useLogin()
  const { params } = useRoute<ReviewStackRouteProp>()
  const { date } = params
  const navigation = useNavigation<RootStackNavigationProp>()

  return (
    <SafeAreaViewWithBg>
      <Text>Review: {date}</Text>
      <Button
        title="back"
        onPress={() => navigation.goBack()}
      />
    </SafeAreaViewWithBg>
  )
}

const style = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
})
