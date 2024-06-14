import { useRef, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import BottomSheet, { BottomSheetScrollView, type BottomSheetScrollViewMethods } from '@gorhom/bottom-sheet'
import { Colors } from '@/assets/colors'
import { TSora, FSora } from '@/assets/icons'
import type { Review } from '@/types/review'

type Props = Pick<Review, 'responseType' | 'responseBody'> & {
  loading?: boolean
  error?: string | null
}

export default function SoraReponseMenu({ responseType, responseBody, loading = false, error }: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null)
  const snapPoints = useMemo(() => ['10%', '100%'], [])
  const isFeeling = responseType === 'feeling'
  const backgroundColor = isFeeling ? Colors.darkGodong : Colors.darkSora
  const conchName = isFeeling ? 'F소라' : 'T소라'
  const ConchSvg = isFeeling ? FSora : TSora

  useEffect(() => {
    if (responseBody.length > 0) {
      bottomSheetRef.current?.expand()
      if (scrollViewRef.current) scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [responseBody, bottomSheetRef])

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
        <Text style={{ ...style.text, ...style.headerText }}>{loading ? `${conchName}가 답변 작성중 ✍️` : `${conchName}의 답장`}</Text>
      </View>
      <BottomSheetScrollView
        ref={scrollViewRef}
        style={{ backgroundColor, ...style.bottomSheet }}
      >
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
