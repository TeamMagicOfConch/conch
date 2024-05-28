import { ReactNode } from 'react'
import { SafeAreaView, type ViewStyle } from 'react-native'
import { Colors } from '@/assets/colors'

export default function ViewWithDefaultBackgroundColor({ children, style }: { children?: ReactNode; style?: ViewStyle }) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgGrey, ...style }}>{children}</SafeAreaView>
}
