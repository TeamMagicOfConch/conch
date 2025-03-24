import { StyleSheet, Text, View, useWindowDimensions, Pressable, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SoraBg } from '@conch/assets/icons'
import { Colors } from '@conch/assets/colors'
import { FeedbackType } from '@conch/utils/api/review/types'
import { useCalendar } from '../hooks'
import { ReviewForCalendar } from '../types'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const getCalendarMaxWidth = (width: number) => {
  if (width >= 744) return '80%' // iPad
  if (width <= 375) return '90%' // iPhone SE
  return '95%' // iPhone
}

const getSoraBgTop = (width: number) => {
  if (width >= 744) return '28%' // iPad
  return '10%' // iPhone
}

interface Props {
  reviews: ReviewForCalendar[]
  date: { year: number; month: number }
}

export default function Calendar({ reviews, date }: Props) {
  const { year, month } = date
  const { calendar } = useCalendar({ reviews, year, month })
  const { width } = useWindowDimensions()
  const router = useRouter()

  return (
    <View style={[style.container, { maxWidth: getCalendarMaxWidth(width) }]}>
      <View style={{ flexDirection: 'row' }}>
        {DAYS.map((day) => (
          <View
            key={day}
            style={{ ...style.alignCenterCell, width: Math.min(width, width * 0.8) / 7 }}
          >
            <Text style={style.calendarHeaderText}>{day}</Text>
          </View>
        ))}
      </View>
      {calendar?.map((week, weekIndex) => (
        <View
          // eslint-disable-next-line
          key={`${year}-${month}-${weekIndex}`}
          style={{ flexDirection: 'row' }}
        >
          {week.map(({ date: cellDate, isToday, isFReview, isTReview }, dayIndex) => {
            const isMovable = !!cellDate && (isFReview || isTReview || isToday)
            const isReviewWritten = isFReview || isTReview
            const feedbackType: FeedbackType | null = isFReview ? 'FEELING' : isTReview ? 'THINKING' : null
            const reviewDate = `${year}-${month}-${cellDate}`

            return (
              <Pressable
                // eslint-disable-next-line
                key={`${year}-${month}-${weekIndex}-${dayIndex}`}
                style={[style.alignCenterCell, { maxWidth: width * 0.8 }]}
                onPress={() =>
                  isMovable &&
                  router.push({
                    pathname: isToday && !isReviewWritten ? '/new-review' : '/review',
                    params: { date: reviewDate, ...(feedbackType && { feedbackType }) },
                  })
                }
              >
                {isReviewWritten && (
                  <SoraBg
                    color={isFReview ? Colors.fSora : Colors.tSora}
                    style={[style.soraBg, { top: getSoraBgTop(width) }]}
                  />
                )}
                <Text style={{ ...style.calendarBodyText, ...(isReviewWritten && { fontWeight: 'bold' }) }}>{cellDate}</Text>
              </Pressable>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
  },
  alignCenterCell: {
    aspectRatio: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soraBg: {
    position: 'absolute',
    zIndex: 0,
  },
  calendarHeaderText: {
    color: Colors.lightGrey,
    fontSize: 10,
  },
  calendarBodyText: {
    color: Colors.writtenGrey,
    fontSize: 14,
  },
})
