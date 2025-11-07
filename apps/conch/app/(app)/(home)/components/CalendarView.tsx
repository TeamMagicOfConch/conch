import Calendar from './Calendar'
import { ReviewForCalendar } from '../types'

interface Props {
  reviews: ReviewForCalendar[]
  date: { year: number; month: number }
}

export default function CalendarView({ reviews, date }: Props) {
  return (
    <Calendar
      reviews={reviews}
      date={date} />
  )
}

