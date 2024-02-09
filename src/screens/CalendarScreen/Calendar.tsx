import React from 'react'
import { Text, View } from 'react-native'
import { useCalendar } from './hooks'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar({ year, month }: { year: number; month: number }) {
  const { calendar } = useCalendar({ year, month })

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        {DAYS.map((day) => (
          <View
            key={day}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
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
          {week.map((day) => (
            <View
              key={day.getDate()}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text>{day.getDate()}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}
