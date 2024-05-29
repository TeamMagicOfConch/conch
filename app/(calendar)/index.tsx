import { useState } from 'react'
import { View } from 'react-native'
import { getToday } from '@/utils'
import { Colors } from '@/assets/colors'
import { Calendar, DateNavigation, ReviewButton } from './components'
import { useTodayReviewWritten } from './hooks'

export default function CalendarScreen() {
  const { year, month, date: todayDate } = getToday()
  const [date, setDate] = useState({ year, month })
  const isTodayReviewWritten = useTodayReviewWritten({ year, month, date: todayDate })

  return (
    <>
      <DateNavigation
        calendarDate={date}
        setCalendarDate={setDate}
      />
      <Calendar date={date} />
      <ReviewButton isTodayReviewWritten={isTodayReviewWritten} />
    </>
  )
}
