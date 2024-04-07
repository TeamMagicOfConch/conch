import React, { useState, useRef } from 'react'
import { Animated, View, PanResponder, Vibration } from 'react-native'
import { BgSora } from '@/assets/icons'
import { Colors } from '@/assets/colors'

export default function SoraHandle() {
  const pan = useRef(new Animated.ValueXY()).current
  const [x, setX] = useState(0)
  pan.addListener((value) => {
    setX(value.x)
  })

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, speed: 6, bounciness: 0 }).start()
      },
    }),
  ).current

  return (
    <>
      <BgSora
        width={40}
        height={40}
        style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 100 }}
        pointerEvents="none"
      />
      <Animated.View
        style={{
          transform: [{ translateX: x / 2 }],
          flexDirection: x > 0 ? 'row-reverse' : 'row',
          gap: 0,
          alignItems: 'center',
        }}
        {...panResponder.panHandlers}
      >
        <View style={{ width: 20, aspectRatio: 1, borderRadius: 100, borderWidth: 3, borderColor: Colors.lightGrey }} />
        <View style={{ width: Math.abs(x), height: 3, backgroundColor: Colors.lightGrey }} />
      </Animated.View>
    </>
  )
}
