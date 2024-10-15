import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useReviewContext } from '../context'
import ReviewSubmitMenu from './ReviewSubmitMenu'
import { Colors } from '@/assets/colors'

export default function NewReviewFooter() {
  const { bottom: paddingBottom } = useSafeAreaInsets()
  const { review } = useReviewContext() || {}
  if (!!review?.responseType) return null

  return (
    <GestureHandlerRootView style={{ flex: 15, backgroundColor: Colors.bgGrey, paddingBottom }}>
      <ReviewSubmitMenu />
    </GestureHandlerRootView>
  )
}
