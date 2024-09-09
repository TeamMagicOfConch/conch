import { StyleSheet, Text, View, useWindowDimensions, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SoraBg } from '@/assets/icons'
import { Colors } from '@/assets/colors'
import { useCalendar } from '../hooks'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

interface Props {
  date: { year: number; month: number }
}

export default function Calendar({ date }: Props) {
  const { year, month } = date
  const { calendar } = useCalendar({ year, month })
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
            const reviewDate = `${year}-${month}-${cellDate}`

            return (
              <Pressable
                // eslint-disable-next-line
                key={`${year}-${month}-${weekIndex}-${dayIndex}`}
                style={[style.alignCenterCell, { width: width / 7 }]}
                onPress={() => isMovable && router.push({ pathname: isToday ? '/new-review' : '/review', params: { date: reviewDate } })}
              >
                {(isFReview || isTReview) && (
                  <SoraBg
                    color={isFReview ? Colors.fSora : Colors.tSora}
                    style={style.soraBg}
                  />
                )}
                <Text style={style.calendarBodyText}>{cellDate}</Text>
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
  todayReverseTriangle: {
    width: 0,
    height: 0,
    position: 'absolute',
    top: 7,
    left: '50%',
    zIndex: 10,
    transform: [{ translateX: -5 }],
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 7,
    borderRightWidth: 5,
    borderBottomWidth: 7,
    borderLeftWidth: 5,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'black',
    borderLeftColor: 'transparent',
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
