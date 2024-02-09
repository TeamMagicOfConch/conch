import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar, DateNavigation } from './components'

export default function CalendarScreen() {
  const now = new Date()
  const [calendarDate, setCalendarDate] = useState({ year: now.getFullYear(), month: now.getMonth() })

  return (
    <SafeAreaView>
      <DateNavigation
        calendarDate={calendarDate}
        setCalendarDate={setCalendarDate}
      />
      <Calendar calendarDate={calendarDate} />
    </SafeAreaView>
  )
}
