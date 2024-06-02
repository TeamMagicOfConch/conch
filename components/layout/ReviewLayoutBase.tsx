import { SafeAreaView, View } from 'react-native'
import { Slot } from 'expo-router'
import { SafeAreaViewWithDefaultBackgroundColor, ViewWithDefaultBackgroundColor } from './view'
import { ReviewScreensNavbar } from './navbar'
import { Colors } from '@/assets/colors'
import { useReviewContext } from '@/app/(review)/new-review/context'

export default function ReviewLayoutBase({ backgroundColor: _backgroundColor = Colors.bgGrey }) {
  const newReviewContext = useReviewContext()
  const { responseType } = newReviewContext?.review || {}
  const backgroundColor = newReviewContext
    ? responseType
      ? responseType === 'thinking'
        ? Colors.darkGodong
        : Colors.darkSora
      : Colors.bgGrey
    : _backgroundColor

  return (
    <>
      <SafeAreaViewWithDefaultBackgroundColor style={{ flex: 0 }} />
      <SafeAreaViewWithDefaultBackgroundColor style={{ flex: 1, backgroundColor }}>
        <ViewWithDefaultBackgroundColor>
          <ReviewScreensNavbar />
          <Slot />
        </ViewWithDefaultBackgroundColor>
      </SafeAreaViewWithDefaultBackgroundColor>
    </>
  )
}
