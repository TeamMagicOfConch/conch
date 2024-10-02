import { Stack } from 'expo-router/stack'

export default function AppLayout() {
  console.log('app layout')
  return <Stack screenOptions={{ header: () => null }} />
}
