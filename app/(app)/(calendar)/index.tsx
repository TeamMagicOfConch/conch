import { useState } from 'react'
import { getToday } from '@/utils'
import { Calendar, DateNavigation, ReviewButton } from './components'
import { useReviewDataAtMonth } from './hooks'

export default function CalendarScreen() {
  const { year, month, date: todayDate } = getToday()
  const [date, setDate] = useState({ year, month })
  const { reviews } = useReviewDataAtMonth({ year, month })
  const todayReview = reviews.find((review) => review.day === todayDate)

  return (
    <>
      <DateNavigation
        calendarDate={date}
        setCalendarDate={setDate}
      />
      <Calendar date={date} />
      <ReviewButton todayReview={todayReview} />
    </>
  )
}
