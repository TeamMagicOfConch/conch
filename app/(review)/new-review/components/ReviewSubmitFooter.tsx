import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { NavigationArrowLeft, NavigationArrowRight } from '@/assets/icons'
import { Colors } from '@/assets/colors'
import SoraHandle from './SoraHandle'

export default function ReviewSubmitFooter() {
  const [handlePosition, setHandlePosition] = useState(0)
  const leftOpacity = Math.max((-1 * handlePosition) / 300, 0)
  const rightOpacity = Math.max((1 * handlePosition) / 300, 0)

  return (
    <View style={style.root}>
      <View style={style.endPoint}>
        <BlurView
          intensity={10}
          style={{ right: 0, ...style.blurView }}
        />
        <View
          style={{
            left: -3,
            backgroundColor: `rgba(55, 79, 255, ${leftOpacity})`,
            ...style.circle,
          }}
        />
        <View style={{ ...style.text, ...style.zIndexFront }}>
          <Text style={{ color: Colors.sora }}>T소라</Text>
        </View>
        <NavigationArrowLeft
          color={Colors.sora}
          style={{ marginRight: -10, ...style.zIndexFront }}
        />
        <NavigationArrowLeft
          color={Colors.sora}
          style={style.zIndexFront}
        />
      </View>
      <SoraHandle
        x={handlePosition}
        setX={setHandlePosition}
      />
      <View style={style.endPoint}>
        <BlurView
          intensity={10}
          style={{ left: 0, ...style.blurView }}
        />
        <NavigationArrowRight
          color={Colors.godong}
          style={style.zIndexFront}
        />
        <NavigationArrowRight
          color={Colors.godong}
          style={{ marginLeft: -10, ...style.zIndexFront }}
        />
        <View style={{ ...style.text, ...style.zIndexFront }}>
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

// zIndex: circle < blurView < else
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
    padding: 5,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    zIndex: 5,
    width: 50,
    aspectRatio: 1,
    borderRadius: 100,
    position: 'absolute',
  },
  blurView: {
    zIndex: 10,
    width: '200%',
    height: '200%',
    position: 'absolute',
    top: '-50%',
  },
  zIndexFront: {
    zIndex: 100,
  },
})
