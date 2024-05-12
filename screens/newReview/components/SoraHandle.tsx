import { useRef } from 'react'
import { Animated, View, PanResponder, Vibration } from 'react-native'
import { BgSora } from '@/assets/icons'
import { Colors } from '@/assets/colors'

export default function SoraHandle({ review, x, setX }: { review: string; x: number; setX: (x: number) => void }) {
  const pan = useRef(new Animated.ValueXY()).current
  const isReviewWritten = review?.length > 0

  pan.addListener((value) => {
    if (isReviewWritten) {
      if (Math.abs(value.x) % 10 === 0) Vibration.vibrate(10)
      setX(value.x)
    }
  })

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, state) => {
        const submitReview = isReviewWritten && Math.abs(state.dx) > 150
        const fActivated = state.dx > 150
        const tActivated = state.dx < -150

        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, speed: 6, bounciness: 0 }).start()
      },
    }),
  ).current

  return (
    <>
      <Animated.View
        style={{
          transform: [{ translateX: x / 2 }],
          flexDirection: x > 0 ? 'row-reverse' : 'row',
          gap: 0,
          alignItems: 'center',
          zIndex: 100,
        }}
        {...panResponder.panHandlers}
      >
        <View style={{ width: 20, aspectRatio: 1, borderRadius: 100, borderWidth: 3, borderColor: Colors.lightGrey }} />
        <View style={{ width: Math.abs(x), height: 3, backgroundColor: Colors.lightGrey }} />
      </Animated.View>
      <View
        style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 100 }}
        pointerEvents="none"
      >
        <BgSora
          width={40}
          height={40}
        />
      </View>
    </>
  )
}
