import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NavigationArrowLeft } from '@assets/icons'
import { ReviewDateParam } from '@/types/navigation'
import { Colors } from '@/assets/colors'

export default function ReviewScreensNavBar({ reviewDate }: { reviewDate: ReviewDateParam }) {
  const { canGoBack, goBack } = useNavigation()
  const [year, _month, date] = reviewDate.split('-').map(Number)
  const month = _month + 1
  const title = `${year}년 ${month}월 ${date}일`

  return (
    <View style={style.nav}>
      <TouchableOpacity
        style={style.goBack}
        onPress={() => canGoBack() && goBack()}
      >
        <NavigationArrowLeft />
      </TouchableOpacity>
      <Text style={style.title}>{title}</Text>
    </View>
  )
}

const style = StyleSheet.create({
  nav: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  goBack: {
    position: 'absolute',
    left: 20,
  },
  title: { color: Colors.lightGrey },
})
