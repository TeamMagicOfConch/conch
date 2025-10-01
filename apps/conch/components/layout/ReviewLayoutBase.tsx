import { Platform, StatusBar } from 'react-native'
import { Slot } from 'expo-router'
import { Colors } from '@conch/assets/colors'
import { useReviewContext } from '@conch/app/(app)/(review)/new-review/context'
import { consts } from '@conch/utils'
import { SafeAreaViewWithDefaultBackgroundColor, ViewWithDefaultBackgroundColor } from './view'
import { ReviewScreensNavbar } from './navbar'

export default function ReviewLayoutBase({ backgroundColor: _backgroundColor = Colors.bgGrey }) {
  const newReviewContext = useReviewContext()
  const { type } = newReviewContext?.review || {}
  const { reviewType } = consts
  const backgroundColor = newReviewContext
    ? type
      ? type === reviewType.thinking
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
