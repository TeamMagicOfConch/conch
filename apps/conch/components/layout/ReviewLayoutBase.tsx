import { Platform, StatusBar, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Slot } from 'expo-router'
import { Colors } from '@conch/assets/colors'
import { useReviewContext } from '@conch/app/(app)/(review)/new-review/context'
import { consts } from '@conch/utils'
import { SafeAreaViewWithDefaultBackgroundColor } from './view'
import { ReviewScreensNavbar } from './navbar'

export default function ReviewLayoutBase({ backgroundColor: _backgroundColor = Colors.bgGrey }) {
  const insets = useSafeAreaInsets()
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
      {/* <SafeAreaViewWithDefaultBackgroundColor
        hidePadding
        style={{ flex: 0 }}
      /> */}
      <SafeAreaViewWithDefaultBackgroundColor
        edges={['top', 'left', 'right']}
        style={{ flex: 1, backgroundColor: Colors.bgGrey, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        {/* <ViewWithDefaultBackgroundColor> */}
        <ReviewScreensNavbar />
        <Slot />
        {/* </ViewWithDefaultBackgroundColor> */}
      </SafeAreaViewWithDefaultBackgroundColor>
      {insets.bottom > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: insets.bottom,
            backgroundColor,
          }}
        />
      )}
    </>
  )
}
