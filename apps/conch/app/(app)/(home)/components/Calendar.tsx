import { StyleSheet, Text, View, useWindowDimensions, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@conch/assets/colors'
import { useCalendar } from '../hooks'
import { ReviewForCalendar } from '../types'
import DateIcon from './DateIcon'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const getCalendarMaxWidth = (width: number) => {
  if (width <= 375) return '90%' // iPhone SE
  if (width < 744) return '95%' // iPhone
  if (width <= 1032) return '80%' // iPad Portrait
  return 600 // iPad Landscape (fixed pixel value)
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
  const maxWidth = getCalendarMaxWidth(width)
  const cellWidth = typeof maxWidth === 'string' 
    ? Math.min(width * (parseInt(maxWidth, 10) / 100)) / 7 
    : maxWidth / 7

  return (
    <View style={[style.container, { maxWidth }]}>
      <View style={{ flexDirection: 'row' }}>
        {DAYS.map((day) => (
          <View
            key={day}
            style={{ ...style.alignCenterCell, width: cellWidth }}
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
            const feedbackType = isFReview ? 'FEELING' : isTReview ? 'THINKING' : null
            const reviewDate = `${year}-${month}-${cellDate}`
            const iconSize = cellWidth * 0.8

            return (
              <Pressable
                // eslint-disable-next-line
                key={`${year}-${month}-${weekIndex}-${dayIndex}`}
                style={[style.alignCenterCell, { width: cellWidth }]}
                onPress={() =>
                  isMovable &&
                  router.push({
                    pathname: isToday && !isReviewWritten ? '/new-review' : '/review',
                    params: { date: reviewDate, ...(feedbackType && { feedbackType }) },
                  })
                }
              >
                {isReviewWritten && feedbackType ? (
                  <DateIcon
                    day={Number(cellDate)}
                    type={feedbackType}
                    size={iconSize}
                  />
                ) : isToday ? (
                  <DateIcon
                    day={Number(cellDate)}
                    type="EMPTY"
                    size={iconSize} />
                ) : (
                  <Text style={style.calendarBodyText}>{cellDate}</Text>
                )}
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
  calendarHeaderText: {
    color: '#AFAFAF',
    fontSize: 14,
  },
  calendarBodyText: {
    color: Colors.writtenGrey,
    fontSize: 14,
  },
})

