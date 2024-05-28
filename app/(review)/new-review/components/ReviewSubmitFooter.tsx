import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { NavigationArrowLeft, NavigationArrowRight } from '@/assets/icons'
import { Colors } from '@/assets/colors'
import { BlurView } from 'expo-blur'
import SoraHandle from './SoraHandle'

export default function ReviewSubmitFooter({ review }: { review: string }) {
  const [handlePosition, setHandlePosition] = useState(0)
  const leftOpacity = Math.max((-1 * handlePosition) / 300, 0)
  const rightOpacity = Math.max((1 * handlePosition) / 300, 0)

  return (
    <View style={style.root}>
      <View style={style.endPoint}>
        <BlurView
          intensity={10}
          style={{ ...style.blurView, right: 0 }}
        />
        <View
          style={{
            ...style.circle,
            left: -3,
            backgroundColor: `rgba(55, 79, 255, ${leftOpacity})`,
          }}
        />
        <View style={{ ...style.text }}>
          <Text style={{ color: Colors.sora }}>T소라</Text>
        </View>
        <NavigationArrowLeft
          color={Colors.sora}
          style={{ marginRight: -10, zIndex: 100 }}
        />
        <NavigationArrowLeft
          color={Colors.sora}
          style={{ zIndex: 100 }}
        />
      </View>
      <SoraHandle
        review={review}
        x={handlePosition}
        setX={setHandlePosition}
      />
      <View style={style.endPoint}>
        <BlurView
          intensity={10}
          style={{ ...style.blurView, left: 0 }}
        />
        <NavigationArrowRight
          color={Colors.godong}
          style={{ zIndex: 100 }}
        />
        <NavigationArrowRight
          color={Colors.godong}
          style={{ marginLeft: -10, zIndex: 100 }}
        />
        <View style={{ ...style.text }}>
          <Text style={{ color: Colors.godong }}>F소라</Text>
        </View>
        <View
          style={{
            ...style.circle,
            right: -3,
            backgroundColor: `rgba(174, 112, 77, ${rightOpacity})`,
          }}
        />
      </View>
    </View>
  )
}

const style = StyleSheet.create({
  root: {
    width: '100%',
    height: 100,
    padding: 20,
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgGrey,
  },
  endPoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    zIndex: 100,
    padding: 5,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    width: '200%',
    height: '200%',
    position: 'absolute',
    top: '-50%',
    zIndex: 10,
  },
  circle: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 100,
    position: 'absolute',
    zIndex: 5,
  },
})
