import React, { useState } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { NavigationArrowLeft, NavigationArrowRight } from '@/assets/icons'
import { Colors } from '@/assets/colors'
import SoraHandle, { HANDLE_ACTIVE_PERCENT } from './SoraHandle'

export default function ReviewSubmitFooter() {
  const [handlePosition, setHandlePosition] = useState(0)
  const { width } = Dimensions.get('window')
  // -50 ~ 50
  const handlePositionPercent = (handlePosition / width) * 100
  const leftOpacity = Math.max(0, Math.min(0.5, -handlePositionPercent / HANDLE_ACTIVE_PERCENT))
  const rightOpacity = Math.max(0, Math.min(0.5, handlePositionPercent / HANDLE_ACTIVE_PERCENT))

  return (
    <View style={style.root}>
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
        <View style={{ ...style.text, ...style.zIndexFront }}>
          <Text style={{ fontWeight: 'bold', color: Colors.tSoraBold }}>T소라</Text>
        </View>
        <View style={{ ...style.arrows, left: '300%' }}>
          <NavigationArrowLeft
            color={Colors.tSora}
            style={{ marginRight: -10, ...style.zIndexFront }}
          />
          <NavigationArrowLeft
            color={Colors.tSoraBold}
            style={style.zIndexFront}
          />
        </View>
      </View>
      <SoraHandle
        x={handlePosition}
        setX={setHandlePosition}
      />
      <View style={style.endPoint}>
        <BlurView
          intensity={20}
          style={{ left: 0, ...style.blurView }}
        />
        <View style={{ ...style.arrows, right: '315%' }}>
          <NavigationArrowRight
            color={Colors.fSoraBold}
            style={{ ...style.zIndexFront }}
          />
          <NavigationArrowRight
            color={Colors.fSora}
            style={{ marginLeft: -10, ...style.zIndexFront }}
          />
        </View>
        <View style={{ ...style.text, ...style.zIndexFront }}>
          <Text style={{ fontWeight: 'bold', color: Colors.fSoraBold }}>F소라</Text>
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
    width: '200%',
    height: '200%',
    position: 'absolute',
    top: '-50%',
  },
  zIndexFront: {
    zIndex: 100,
  },
})
