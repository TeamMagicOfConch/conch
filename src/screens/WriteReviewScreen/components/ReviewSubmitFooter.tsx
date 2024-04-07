import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { BgSora, NavigationArrowLeft, NavigationArrowRight } from '@/assets/icons'
import { Colors } from '@/assets/colors'
import SoraHandle from './SoraHandle'

export default function ReviewSubmitFooter() {
  return (
    <View style={style.root}>
      <View style={style.endPoint}>
        <Text>T소라</Text>
        <NavigationArrowLeft
          color={Colors.sora}
          style={{ marginRight: -10 }}
        />
        <NavigationArrowLeft color={Colors.sora} />
      </View>
      <SoraHandle />
      <View style={style.endPoint}>
        <NavigationArrowRight color={Colors.godong} />
        <NavigationArrowRight
          color={Colors.godong}
          style={{ marginLeft: -10 }}
        />
        <Text>F소라</Text>
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
})
