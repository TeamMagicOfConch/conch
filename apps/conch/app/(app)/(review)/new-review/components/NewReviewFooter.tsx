import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@conch/assets/colors'
import { useReviewContext } from '../context'
import ReviewSubmitMenu from './ReviewSubmitMenu'

export default function NewReviewFooter() {
  const { bottom: paddingBottom } = useSafeAreaInsets()
  const { review } = useReviewContext() || {}
  if (review?.type) return null

  return (
    <GestureHandlerRootView style={{ flex: 15, backgroundColor: Colors.bgGrey, paddingBottom }}>
      <ReviewSubmitMenu />
    </GestureHandlerRootView>
  )
}
