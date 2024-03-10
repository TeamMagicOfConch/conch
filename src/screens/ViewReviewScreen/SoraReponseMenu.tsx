import React, { useRef, useMemo } from 'react'
import { Text, StyleSheet } from 'react-native'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Colors } from '@/assets/colors'
import type { ReviewData } from './hooks'

export default function SoraReponseMenu({ responseType, responseBody }: Pick<ReviewData, 'responseType' | 'responseBody'>) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ['17%', '93%'], [])
  const backgroundColor = responseType === 'feeling' ? Colors.darkSora : Colors.darkGodong

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      handleStyle={{ backgroundColor, ...style.handle }}
      handleIndicatorStyle={{ backgroundColor: Colors.white }}
    >
      <BottomSheetScrollView style={{ backgroundColor, ...style.bottomSheet }}>
        <Text style={style.body}>{responseBody}</Text>
      </BottomSheetScrollView>
    </BottomSheet>
  )
}

const style = StyleSheet.create({
  handle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheet: {
    flex: 1,
    padding: 45,
  },
  body: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 30,
  },
})
