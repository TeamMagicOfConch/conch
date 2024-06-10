import { ReactNode } from 'react'
import { SafeAreaView, Platform, StatusBar, type ViewStyle } from 'react-native'
import { Colors } from '@/assets/colors'

export default function SafeAreaViewWithDefaultBackgroundColor({
  children,
  style,
  hidePadding = false,
}: {
  children?: ReactNode
  style?: ViewStyle
  hidePadding?: boolean
}) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.bgGrey, ...style, paddingTop: !hidePadding && Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      {children}
    </SafeAreaView>
  )
}
