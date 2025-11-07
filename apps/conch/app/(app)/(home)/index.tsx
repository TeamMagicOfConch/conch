import { useMemo, useState } from 'react'
import { getToday } from '@conch/utils'
import { CalendarView, ListView, ViewToggleButton, DateNavigation, ReviewButton } from './components'
import { useReviewDataAtMonth, useReviewList } from './hooks'

type ViewMode = 'calendar' | 'list'

export default function HomeScreen() {
  const { year, month, date: todayDate } = useMemo(() => getToday(), [])
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [date, setDate] = useState({ year, month })
  const { reviews } = useReviewDataAtMonth(date)
  const { reviews: listReviews } = useReviewList()

  const handleToggle = () => {
    setViewMode((prev) => (prev === 'calendar' ? 'list' : 'calendar'))
    setDate({ year, month })
  }

  // calendar 모드일 때는 해당 월의 리뷰, list 모드일 때는 전체 리뷰에서 todayReview 찾기
  const todayReview = viewMode === 'calendar'
    ? reviews.find((review) => review.day === todayDate)
    : listReviews.find((review) => {
      const reviewDate = new Date(review.reviewDate)
      return (
        reviewDate.getFullYear() === year &&
          reviewDate.getMonth() === month &&
          reviewDate.getDate() === todayDate
      )
    })

  const calendarTodayReview = todayReview
    ? 'day' in todayReview
      ? todayReview
      : { day: todayDate, feedbackType: todayReview.feedbackType }
    : undefined

  return (
    <>
      <DateNavigation
        mode={viewMode}
        reviews={reviews}
        calendarDate={date}
        setCalendarDate={setDate}
      />
      {viewMode === 'calendar' ? (
        <CalendarView
          reviews={reviews}
          date={date} />
      ) : (
        <ListView />
      )}
      <ReviewButton todayReview={calendarTodayReview} />
      <ViewToggleButton
        viewMode={viewMode}
        onToggle={handleToggle} />
    </>
  )
}
