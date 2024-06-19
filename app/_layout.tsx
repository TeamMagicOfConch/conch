import { Stack } from 'expo-router/stack'
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream'
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch'

polyfillFetch()
polyfillReadableStream()

export default function Layout() {
  return <Stack screenOptions={{ header: () => null }} />
}
