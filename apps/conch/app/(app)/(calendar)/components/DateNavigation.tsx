import { View, Text, Pressable, StyleSheet } from 'react-native'
import { formatYearMonthDate } from '@conch/utils/string'
import { Colors } from '@conch/assets/colors'
import { NavigationArrowLeft, NavigationArrowRight } from '@conch/assets/icons'
import { useReviewDataAtMonth } from '../hooks'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { consts } from '@conch/utils'

interface Props {
  calendarDate: { year: number; month: number }
  setCalendarDate: (date: { year: number; month: number }) => void
}

export default function DateNavigation({ calendarDate, setCalendarDate }: Props) {
  const [username, setUsername] = useState<string | null>()
  const { year, month } = calendarDate
  const displayDate = formatYearMonthDate({ year, month: month + 1 })
  const { reviews } = useReviewDataAtMonth({ year, month })
  const reviewsCount = reviews?.length ?? 0

  useEffect(() => {
    ;(async () => setUsername(await AsyncStorage.getItem(consts.asyncStorageKey.username)))()
  }, [])

  function handlePrevMonth() {
    if (month === 0) {
      setCalendarDate({ year: year - 1, month: 11 })
    } else {
      setCalendarDate({ year, month: month - 1 })
    }
  }

  function handleNextMonth() {
    if (month === 11) {
      setCalendarDate({ year: year + 1, month: 0 })
    } else {
      setCalendarDate({ year, month: month + 1 })
    }
  }

  return (
    <View style={style.root}>
      <DateNatigateButton
        direction="prev"
        onPress={() => handlePrevMonth()}
      />
      <View style={style.textWrapper}>
        <Text style={style.date}>{displayDate}</Text>
        <Text style={style.reviewsCount}>
          {username}님, {month + 1}월에는
        </Text>
        <Text style={style.reviewsCount}>총 {reviewsCount}번 회고를 작성했어요</Text>
      </View>
      <DateNatigateButton
        direction="next"
        onPress={() => handleNextMonth()}
      />
    </View>
  )
}

function DateNatigateButton({ direction, onPress }: { direction: 'prev' | 'next'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 50,
      }}
    >
      {direction === 'prev' ? <NavigationArrowLeft color={Colors.lightGrey} /> : <NavigationArrowRight color={Colors.lightGrey} />}
    </Pressable>
  )
}

const style = StyleSheet.create({
  root: {
    width: '74.62%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  textWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsCount: {
    fontSize: 12,
    color: Colors.lightGrey,
  },
})
