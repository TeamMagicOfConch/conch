import { View, Pressable, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { NavigationArrowLeft } from '@/assets/icons'
import { Colors } from '@/assets/colors'
import NavBarBase from './NavBarBase'

export default function ReviewDateNavBar() {
  const { date: reviewDate } = useLocalSearchParams()
  const [year, _month, date] = String(reviewDate).split('-').map(Number)
  const month = _month + 1
  const title = `🌴${year}년 ${month}월 ${date}일`

  return (
    <NavBarBase
      left={<GoBack />}
      title={title}
    />
  )
}

function GoBack() {
  const router = useRouter()
  return (
    <Pressable onPress={() => router.back()}>
      <NavigationArrowLeft color={Colors.lightGrey} />
    </Pressable>
  )
}
