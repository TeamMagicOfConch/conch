import { Pressable, Text, StyleSheet, GestureResponderEvent, ViewStyle, StyleProp } from 'react-native'
import { Colors } from '@conch/assets/colors'
import { ReactNode } from 'react'

export default function PrimaryButton({
  style,
  onPress,
  children,
  disabled = false,
}: {
  style?: StyleProp<ViewStyle>
  onPress: (e: GestureResponderEvent) => void
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[innerStyle.button, disabled ? innerStyle.disabled : null, style]}
    >
      <Text style={[innerStyle.text, disabled ? innerStyle.disabledText : null]}>{children}</Text>
    </Pressable>
  )
}

const innerStyle = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,

    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 200,
    backgroundColor: Colors.onboardingPrimary,

    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: Colors.grey,
  },
  text: {
    fontWeight: 'bold',
    color: Colors.white,
  },
  disabledText: {
    color: Colors.bgGrey,
  },
})
