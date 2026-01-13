import { ReactNode } from "react"
import { View, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function ViewWithBottomPadding({ children, style }: { children: ReactNode, style?: ViewStyle }) {
  const { bottom } = useSafeAreaInsets()
  return <View style={{ ...style, paddingBottom: bottom }}>{children}</View>
}