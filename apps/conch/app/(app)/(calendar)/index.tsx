import { useMemo, useState } from 'react'
import { getToday } from '@conch/utils'
import { Calendar, DateNavigation, ReviewButton } from './components'
import { useReviewDataAtMonth } from './hooks'

export default function CalendarScreen() {
  const { year, month, date: todayDate } = useMemo(() => getToday(), [])
  const [date, setDate] = useState({ year, month })
  const { reviews } = useReviewDataAtMonth(date)
  const todayReview = reviews.find((review) => review.day === todayDate)

  return (
    <>
      <DateNavigation
        reviews={reviews}
        calendarDate={date}
        setCalendarDate={setDate}
      />
      <Calendar
        reviews={reviews}
        date={date}
      />
      <ReviewButton todayReview={todayReview} />
    </>
  )
}
