import { Platform, StatusBar } from 'react-native'
import { Slot } from 'expo-router'
import { Colors } from '@/assets/colors'
import { useReviewContext } from '@/app/(app)/(review)/new-review/context'
import { SafeAreaViewWithDefaultBackgroundColor, ViewWithDefaultBackgroundColor } from './view'
import { ReviewScreensNavbar } from './navbar'
import { consts } from '@/utils'

export default function ReviewLayoutBase({ backgroundColor: _backgroundColor = Colors.bgGrey }) {
  const newReviewContext = useReviewContext()
  const { feedbackType } = newReviewContext?.review || {}
  const { reviewType } = consts
  const backgroundColor = newReviewContext
    ? feedbackType
      ? feedbackType === reviewType.thinking
        ? Colors.tSoraBg
        : Colors.fSoraBg
      : _backgroundColor
    : _backgroundColor

  return (
    <>
      <SafeAreaViewWithDefaultBackgroundColor
        hidePadding
        style={{ flex: 0 }}
      />
      <SafeAreaViewWithDefaultBackgroundColor style={{ flex: 1, backgroundColor, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <ViewWithDefaultBackgroundColor>
          <ReviewScreensNavbar />
          <Slot />
        </ViewWithDefaultBackgroundColor>
      </SafeAreaViewWithDefaultBackgroundColor>
    </>
  )
}
