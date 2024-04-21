import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { NavigationArrowLeft, NavigationArrowRight } from '@/assets/icons'
import { Colors } from '@/assets/colors'
import SoraHandle from './SoraHandle'

export default function ReviewSubmitFooter({ review }: { review: string }) {
  const [handlePosition, setHandlePosition] = useState(0)
  const leftOpacity = Math.max((-1 * handlePosition) / 150, 0)
  const rightOpacity = Math.max((1 * handlePosition) / 150, 0)

  return (
    <View style={style.root}>
      <View style={style.endPoint}>
        <View style={{ ...style.text, backgroundColor: `rgba(55, 79, 255, ${leftOpacity})` }}>
          <Text>T소라</Text>
        </View>
        <NavigationArrowLeft
          color={Colors.sora}
          style={{ marginRight: -10 }}
        />
        <NavigationArrowLeft color={Colors.sora} />
      </View>
      <SoraHandle
        review={review}
        x={handlePosition}
        setX={setHandlePosition}
      />
      <View style={style.endPoint}>
        <NavigationArrowRight color={Colors.godong} />
        <NavigationArrowRight
          color={Colors.godong}
          style={{ marginLeft: -10 }}
        />
        <View style={{ ...style.text, backgroundColor: `rgba(174, 112, 77, ${rightOpacity})` }}>
          <Text>F소라</Text>
        </View>
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
    padding: 5,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
})
