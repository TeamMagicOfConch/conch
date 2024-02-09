import React from 'react'
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useCalendar } from '../hooks'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

interface Props {
  calendarDate: { year: number; month: number }
}

export default function Calendar({ calendarDate }: Props) {
  const { year, month } = calendarDate
  const { calendar } = useCalendar({ year, month })
  const { width } = useWindowDimensions()

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        {DAYS.map((day) => (
          <View
            key={day}
            style={[style.alignCenterCell, { width: width / 7 }]}
          >
            <Text>{day}</Text>
          </View>
        ))}
      </View>
      {calendar?.map((week, weekIndex) => (
        <View
          // eslint-disable-next-line
          key={`${year}-${month}-${weekIndex}`}
          style={{ flexDirection: 'row' }}
        >
          {week.map((day, dayIndex) => (
            <View
              // eslint-disable-next-line
              key={`${year}-${month}-${weekIndex}-${dayIndex}`}
              style={[style.alignCenterCell, { width: width / 7 }]}
            >
              <Text>{day}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

const style = StyleSheet.create({
  alignCenterCell: {
    aspectRatio: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
