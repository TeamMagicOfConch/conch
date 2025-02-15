import { ReactNode } from 'react'
import { View } from 'react-native'
import { Colors } from '@conch/assets/colors'

export default function ViewWithDefaultBackgroundColor({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: Colors.bgGrey }}>{children}</View>
}
