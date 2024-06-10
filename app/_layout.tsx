import { Stack } from 'expo-router/stack'
import 'react-native-polyfill-globals/auto'

export default function Layout() {
  return <Stack screenOptions={{ header: () => null }} />
}
