import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { formatYearMonthDate } from '@utils/string'
import { Colors } from '@/assets/colors'
import { NavigationArrowLeft, NavigationArrowRight } from '@assets/icons'
import { useReviewDataAtMonth } from '../hooks'

interface Props {
  calendarDate: { year: number; month: number }
  setCalendarDate: (date: { year: number; month: number }) => void
}

export default function DateNavigation({ calendarDate, setCalendarDate }: Props) {
  const { year, month } = calendarDate
  const displayDate = formatYearMonthDate({ year, month: month + 1 })
  const { reviews } = useReviewDataAtMonth({ year, month })
  const reviewsCount = reviews?.length ?? 0

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
          {month + 1}월에는 총 {reviewsCount}번 회고를 작성했어요
        </Text>
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
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderRadius: 50,
      }}
    >
      {direction === 'prev' ? <NavigationArrowLeft color={Colors.lightGrey} /> : <NavigationArrowRight color={Colors.lightGrey} />}
    </TouchableOpacity>
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
