import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/assets/colors'
import { ViewStyle } from 'react-native'

export default function SafeAreaViewWithBg({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const basicStyle = {
    flex: 1,
    backgroundColor: Colors.bgGrey,
  }
  return <SafeAreaView style={{ ...style, ...basicStyle }}>{children}</SafeAreaView>
}
