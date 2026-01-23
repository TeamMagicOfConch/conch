import { Pressable, StyleSheet, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@conch/assets/colors'

export default function DebugButton() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed, { bottom: bottom + 166 }]}
      onPress={() => router.push('/debug-jar')}
    >
      <Text style={styles.text}>🐛</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 28,
    backgroundColor: Colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: 24,
  },
})
