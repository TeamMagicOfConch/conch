import React, { useState } from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Calendar from './Calendar'

export default function CalendarScreen() {
  const now = new Date()
  const [calendarDate, setCalendarDate] = useState({ year: now.getFullYear(), month: now.getMonth() })

  return (
    <SafeAreaView>
      <Text>Calendar Screen</Text>
      <Calendar
        year={calendarDate.year}
        month={calendarDate.month}
      />
    </SafeAreaView>
  )
}
