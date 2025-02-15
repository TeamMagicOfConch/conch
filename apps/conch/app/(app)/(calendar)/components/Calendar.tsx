import { StyleSheet, Text, View, useWindowDimensions, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SoraBg } from '@conch/assets/icons'
import { Colors } from '@conch/assets/colors'
import { FeedbackType } from '@conch/utils/api/review/types'
import { useCalendar } from '../hooks'
import { ReviewForCalendar } from '../types'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

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
    <>
      <View style={{ flexDirection: 'row' }}>
        {DAYS.map((day) => (
          <View
            key={day}
            style={{ ...style.alignCenterCell, width: width / 7 }}
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
                style={[style.alignCenterCell, { width: width / 7 }]}
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
                    style={style.soraBg}
                  />
                )}
                <Text style={{ ...style.calendarBodyText, ...(isReviewWritten && { fontWeight: 'bold' }) }}>{cellDate}</Text>
              </Pressable>
            )
          })}
        </View>
      ))}
    </>
  )
}

const style = StyleSheet.create({
  alignCenterCell: {
    aspectRatio: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soraBg: {
    position: 'absolute',
    top: '8%',
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
