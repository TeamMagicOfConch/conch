import { ReactNode } from 'react'
import { Platform, StatusBar, type ViewStyle } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { Colors } from '@conch/assets/colors'

export default function SafeAreaViewWithDefaultBackgroundColor({
  children,
  style,
  hidePadding = false,
  edges,
}: {
  children?: ReactNode
  style?: ViewStyle
  hidePadding?: boolean
  edges?: Edge[]
}) {
  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: Colors.bgGrey, ...style, paddingTop: !hidePadding && Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      {children}
    </SafeAreaView>
  )
}
