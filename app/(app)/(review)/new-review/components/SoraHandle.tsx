import { useRef, useState, useEffect } from 'react'
import { StyleSheet, Animated, View, PanResponder, type PanResponderInstance, Dimensions } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { Sora } from '@/assets/icons'
import { Colors } from '@/assets/colors'
import { useReviewContext } from '../context'

export const HANDLE_ACTIVE_PERCENT = 70

export default function SoraHandle({ x, setX }: { x: number; setX: (x: number) => void }) {
  const router = useRouter()
  const { date: reviewDate } = useLocalSearchParams()
  const [panResponder, setPanResponder] = useState<PanResponderInstance>()
  const lastHapticTime = useRef(Date.now())
  const pan = useRef(new Animated.ValueXY()).current
  const reviewContext = useReviewContext()

  if (!reviewContext) return null
  const { review, setReview } = reviewContext
  const isReviewWritten = review.body.length > 0

  pan.addListener((value) => {
    if (isReviewWritten) {
      setX(value.x)
    }
  })

  useEffect(
    () =>
      setPanResponder(
        PanResponder.create({
          onMoveShouldSetPanResponder: () => true,
          onPanResponderMove: Animated.event([null, { dx: pan.x }], {
            useNativeDriver: false,
            listener: (evt) => {
              if (isReviewWritten) {
                const now = Date.now()
                if (now - lastHapticTime.current > 100) {
                  impactAsync(ImpactFeedbackStyle.Light)
                  lastHapticTime.current = now
                }
              }
            },
          }),
          onPanResponderRelease: (_, state) => {
            // -100 ~ 100
            const dxPercent = (state.dx / Dimensions.get('window').width) * 200
            const fActivated = dxPercent > HANDLE_ACTIVE_PERCENT
            const tActivated = dxPercent < -HANDLE_ACTIVE_PERCENT
            const activated = (fActivated || tActivated) && isReviewWritten

            if (activated) {
              setReview((prev) => ({ ...prev, responseType: tActivated ? 'thinking' : 'feeling' }))
            }

            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, speed: 6, bounciness: 0 }).start()
          },
        }),
      ),
    [isReviewWritten],
  )

  return (
    <>
      <Animated.View
        style={{
          transform: [{ translateX: x / 2 }],
          flexDirection: x > 0 ? 'row-reverse' : 'row',
          ...style.animated,
        }}
        {...panResponder?.panHandlers}
      >
        <View style={style.handle} />
        <View style={{ width: Math.abs(x), ...style.handleBar }} />
      </Animated.View>
      <View
        style={style.soraView}
        pointerEvents="none"
      >
        <Sora
          color="white"
          width={40}
          height={40}
        />
      </View>
    </>
  )
}

const style = StyleSheet.create({
  animated: {
    gap: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  handle: {
    width: 20,
    aspectRatio: 1,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  handleBar: {
    height: 2,
    backgroundColor: Colors.black,
  },
  soraView: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    pointerEvents: 'none',
    zIndex: 100,
  },
})
