import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/assets/colors'

export default function SafeAreaViewWithBg({ children }: { children: React.ReactNode }) {
  const style = {
    flex: 1,
    backgroundColor: Colors.bgGrey,
  }
  return <SafeAreaView style={style}>{children}</SafeAreaView>
}
