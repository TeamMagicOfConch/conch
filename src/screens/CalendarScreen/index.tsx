import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getToday } from '@/utils'
import { Calendar, DateNavigation, ReviewButton } from './components'
import { useTodayReviewWritten } from './hooks'

export default function CalendarScreen() {
  const { year, month, date: todayDate } = getToday()
  const [date, setDate] = useState({ year, month })
  const isTodayReviewWritten = useTodayReviewWritten({ year, month, date: todayDate })

  return (
    <SafeAreaView>
      <DateNavigation
        calendarDate={date}
        setCalendarDate={setDate}
      />
      <Calendar date={date} />
      <ReviewButton isTodayReviewWritten={isTodayReviewWritten} />
    </SafeAreaView>
  )
}
