import { Stack } from 'expo-router/stack'
import { polyfill } from '@/utils'

polyfill()

export default function Layout() {
  return <Stack screenOptions={{ header: () => null }} />
}
