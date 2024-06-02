import React, { useRef, useMemo } from 'react'
import { SafeAreaView, View, Text, StyleSheet } from 'react-native'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Colors } from '@/assets/colors'
import { TSora, FSora } from '@/assets/icons'
import type { Review } from '@/types/review'

export default function SoraReponseMenu({ responseType, responseBody }: Pick<Review, 'responseType' | 'responseBody'>) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ['12%', '100%'], [])
  const isFeeling = responseType === 'feeling'
  const backgroundColor = isFeeling ? Colors.darkGodong : Colors.darkSora
  const conchName = isFeeling ? 'F소라' : 'T소라'
  const ConchSvg = isFeeling ? FSora : TSora

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      handleStyle={{ backgroundColor, ...style.handle }}
      handleIndicatorStyle={{ backgroundColor: Colors.white }}
    >
      <View style={{ backgroundColor, ...style.header }}>
        {/** TODO: letter-shape background */}
        <ConchSvg
          width={40}
          height={40}
        />
        <Text style={{ ...style.text, ...style.headerText }}>{conchName}의 답장</Text>
      </View>
      <BottomSheetScrollView style={{ backgroundColor, ...style.bottomSheet }}>
        <Text style={{ ...style.text, ...style.body }}>{responseBody}</Text>
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
    padding: '13%',
    paddingTop: '5%',
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  text: {
    color: Colors.white,
    lineHeight: 30,
  },
  headerText: {
    fontSize: 12,
  },
  body: {
    fontSize: 14,
    paddingBottom: '20%',
  },
})
