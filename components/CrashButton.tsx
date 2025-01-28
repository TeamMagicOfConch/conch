import { Pressable, Text } from 'react-native'
import crashlytics from '@react-native-firebase/crashlytics'

function crash() {
  console.log('crash')
  crashlytics().log('Test log message')
  crashlytics().crash()
}

export default function CrashButton() {
  return (
    <Pressable onPress={crash}>
      <Text>CRASH</Text>
    </Pressable>
  )
}
