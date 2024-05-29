import { ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '@/assets/colors'

export default function NavBarBase({ left, right, title }: { left?: ReactNode; right?: ReactNode; title?: string }) {
  return (
    <View style={style.nav}>
      {left && <View style={style.left}>{left}</View>}
      {title && <Text style={style.text}>{title}</Text>}
      {right && <View style={style.right}>{right}</View>}
    </View>
  )
}

const style = StyleSheet.create({
  nav: {
    width: '100%',
    height: '9.48%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  left: {
    position: 'absolute',
    left: 20,
  },
  right: {
    position: 'absolute',
    right: 20,
  },
  text: {
    color: Colors.lightGrey,
    fontSize: 12,
  },
})
