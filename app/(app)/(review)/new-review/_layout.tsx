import { ReviewLayoutBase } from '@/components'
import { ReviewContextProvider } from './context'
import { Footer } from './components'
import { Keyboard, Pressable } from 'react-native'

export default function ReviewLayout() {
  return (
    <ReviewContextProvider>
      <Pressable
        style={{ flex: 85 }}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <ReviewLayoutBase />
      </Pressable>
      <Footer />
    </ReviewContextProvider>
  )
}
