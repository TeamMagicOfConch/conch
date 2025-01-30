import { useRef, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import BottomSheet, { BottomSheetScrollView, type BottomSheetScrollViewMethods } from '@gorhom/bottom-sheet'

import { Colors } from '@conch/assets/colors'
import { Sora } from '@conch/assets/icons'
import type { Review } from '@conch/utils/api/review/types'
import { consts } from '@conch/utils'
import { useRouteInfo } from 'expo-router/build/hooks'

type Props = Pick<Review, 'feedbackType' | 'feedback'> & {
  loading?: boolean
  error?: string | null
}

export default function SoraReponseMenu({ feedbackType, feedback: responseBody, loading = false, error }: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null)
  const snapPoints = useMemo(() => ['10%', '100%'], [])
  const { pathname } = useRouteInfo()
  const isFeeling = feedbackType === consts.reviewType.feeling
  const backgroundColor = isFeeling ? Colors.fSoraBg : Colors.tSoraBg
  const conchName = isFeeling ? 'F소라' : 'T소라'

  useEffect(() => {
    if (pathname !== '/review' && responseBody?.length > 0) {
      bottomSheetRef.current?.expand()
      if (scrollViewRef.current) scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [pathname, responseBody, bottomSheetRef])

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      handleStyle={{ backgroundColor }}
      handleIndicatorStyle={{ display: 'none' }}
      style={style.bottomSheet}
    >
      <View style={{ backgroundColor, ...style.header }}>
        {/** TODO: letter-shape background */}
        <Sora
          color={isFeeling ? Colors.fSora : Colors.tSora}
          width={40}
          height={40}
        />
        <Text style={{ ...style.text, ...style.headerText }}>{loading ? `${conchName}가 답변 작성중 ✍️` : `${conchName}의 답장`}</Text>
      </View>
      <BottomSheetScrollView
        ref={scrollViewRef}
        style={{ backgroundColor, ...style.scrollView }}
      >
        <Text style={{ ...style.text, ...style.body }}>{responseBody}</Text>
      </BottomSheetScrollView>
    </BottomSheet>
  )
}

const style = StyleSheet.create({
  bottomSheet: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.black,
  },
  scrollView: {
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
    color: Colors.black,
    lineHeight: 30,
  },
  headerText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 14,
    paddingBottom: '20%',
  },
})
