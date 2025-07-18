import { ReviewLayoutBase } from '@conch/components'
import { Keyboard, Pressable } from 'react-native'
import { ReviewContextProvider } from './context'
import { NewReviewFooter } from './components'

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
      <NewReviewFooter />
    </ReviewContextProvider>
  )
}
