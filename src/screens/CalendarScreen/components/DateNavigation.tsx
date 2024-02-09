import React from 'react'
import { View, Text, Button, TouchableOpacity } from 'react-native'
import { formatYearMonthDate } from '@/util'

interface Props {
  calendarDate: { year: number; month: number }
  setCalendarDate: (date: { year: number; month: number }) => void
}

export default function DateNavigation({ calendarDate, setCalendarDate }: Props) {
  const { year, month } = calendarDate
  const displayDate = formatYearMonthDate({ year, month: month + 1 })

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
    <View
      style={{
        width: '75%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
      }}
    >
      <DateNatigateButton
        direction="prev"
        onPress={() => handlePrevMonth()}
      />
      <Text>{displayDate}</Text>
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
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'lightgray',
      }}
    >
      <Text>{direction === 'prev' ? '이전 달' : '다음 달'}</Text>
    </TouchableOpacity>
  )
}
