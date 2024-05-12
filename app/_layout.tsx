import { Colors } from '@/assets/colors'
import { Stack } from 'expo-router/stack'
import { SafeAreaView } from 'react-native'

export default function Layout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgGrey }}>
      <Stack screenOptions={{ header: () => null }} />
    </SafeAreaView>
  )
}
