import React, { useState } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { NavigationArrowLeft, NavigationArrowRight } from '@/assets/icons'
import { Colors } from '@/assets/colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SoraHandle, { HANDLE_ACTIVE_PERCENT } from './SoraHandle'
import { useReviewContext } from '../context'

export default function ReviewSubmitMenu() {
  const [handlePosition, setHandlePosition] = useState(0)
  const [arrowsWidth, setArrowsWidth] = useState(0)
  const { review } = useReviewContext() || {}
  const { bottom } = useSafeAreaInsets()

  const { width } = Dimensions.get('window')
  const isReviewWritten = review ? review.body.length > 0 : false
  // -50 ~ 50
  const handlePositionPercent = (handlePosition / width) * 100
  const leftOpacity = Math.max(0, Math.min(0.5, -handlePositionPercent / HANDLE_ACTIVE_PERCENT))
  const rightOpacity = Math.max(0, Math.min(0.5, handlePositionPercent / HANDLE_ACTIVE_PERCENT))

  return (
    <View style={{ ...style.root, ...(!isReviewWritten && { opacity: 0.25 }), bottom }}>
      <View style={style.endPoint}>
        <BlurView
          intensity={20}
          style={{ right: 0, ...style.blurView }}
        />
        <View
          style={{
            left: 6,
            backgroundColor: `rgba(56, 96, 255, ${leftOpacity})`,
            ...style.circle,
          }}
        />
        <View style={{ ...style.textView, ...style.zIndexFront }}>
          <Text style={{ ...style.text, color: Colors.tSoraBold }}>T소라</Text>
        </View>
      </View>
      <View
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout
          setArrowsWidth(width)
        }}
        style={{ ...style.arrows, left: '50%', transform: [{ translateX: -0.5 * arrowsWidth - 40 }] }}
      >
        <NavigationArrowLeft
          color={Colors.tSora}
          style={{ marginRight: -10, ...style.zIndexFront }}
        />
        <NavigationArrowLeft
          color={Colors.tSoraBold}
          style={style.zIndexFront}
        />
      </View>
      <SoraHandle
        isReviewWritten={isReviewWritten}
        x={handlePosition}
        setX={setHandlePosition}
      />
      <View style={{ ...style.arrows, right: '50%', transform: [{ translateX: 0.5 * arrowsWidth + 30 }] }}>
        <NavigationArrowRight
          color={Colors.fSoraBold}
          style={{ ...style.zIndexFront }}
        />
        <NavigationArrowRight
          color={Colors.fSora}
          style={{ marginLeft: -10, ...style.zIndexFront }}
        />
      </View>
      <View style={style.endPoint}>
        <BlurView
          intensity={20}
          style={{ left: 0, ...style.blurView }}
        />
        <View style={{ ...style.textView, ...style.zIndexFront }}>
          <Text style={{ ...style.text, color: Colors.fSoraBold }}>F소라</Text>
        </View>
        <View
          style={{
            ...style.circle,
            right: 6,
            backgroundColor: `rgba(255, 65, 119, ${rightOpacity})`,
          }}
        />
      </View>
    </View>
  )
}

// zIndex: circle < blurView < else
const style = StyleSheet.create({
  root: {
    width: '100%',
    padding: 20,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgGrey,
  },
  endPoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textView: {
    padding: 5,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrows: {
    flexDirection: 'row',
    position: 'absolute',
  },
  circle: {
    zIndex: 5,
    width: 30,
    aspectRatio: 1,
    borderRadius: 100,
    position: 'absolute',
  },
  blurView: {
    zIndex: 10,
    width: '300%',
    height: '300%',
    position: 'absolute',
    top: '-50%',
  },
  zIndexFront: {
    zIndex: 100,
  },
})
