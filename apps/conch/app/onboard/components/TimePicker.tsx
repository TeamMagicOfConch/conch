import { useState, useEffect, useCallback } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Modal } from 'react-native'
import { BlurView } from 'expo-blur'
import WheelPicker from '@quidone/react-native-wheel-picker'
import { Colors } from '@conch/assets/colors'
import { TimePickerProps, WHEN_OPTIONS } from './types'

// 휠 피커 옵션 데이터 타입
type PickerOption = {
  value: number
  label: string
}

// 휠 피커 옵션 데이터
const PERIOD_OPTIONS: PickerOption[] = [
  { value: 0, label: '오전' },
  { value: 1, label: '오후' }
]
const HOUR_OPTIONS: PickerOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: String(i + 1)
}))
const MINUTE_OPTIONS: PickerOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: String(i * 5).padStart(2, '0')
}))

// 옵션에 따른 기본 시간을 휠 인덱스로 변환
const getDefaultIndicesByOption = (option: number): { period: number; hour: number; minute: number } => {
  const defaultTime = WHEN_OPTIONS[option]
  const [hourStr, minuteStr] = defaultTime.value.split(':')
  const hour24 = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)

  const period = hour24 >= 12 ? 1 : 0
  const hour12 = hour24 % 12 || 12
  const hourIndex = hour12 - 1
  const minuteIndex = Math.floor(minute / 5)

  return { period, hour: hourIndex, minute: minuteIndex }
}

// "HH:mm 오전/오후" 형식 문자열을 휠 인덱스로 파싱
const parseTimeToIndices = (timeString: string): { period: number; hour: number; minute: number } | null => {
  const parts = timeString.split(' ')
  if (parts.length !== 2) return null

  const [timePart, periodPart] = parts
  const [hourPart, minutePart] = timePart.split(':')

  if (!hourPart || !minutePart || !periodPart) return null

  const hour = parseInt(hourPart, 10)
  const minute = parseInt(minutePart, 10)

  const period = periodPart === '오후' ? 1 : 0
  const hourIndex = hour - 1
  const minuteIndex = Math.floor(minute / 5)

  return { period, hour: hourIndex, minute: minuteIndex }
}

// 휠 피커 컴포넌트
export default function TimePicker({
  visible,
  onClose,
  onConfirm,
  selectedTime,
  selectedOption,
}: TimePickerProps) {
  // 기본 인덱스 계산
  const defaultIndices = getDefaultIndicesByOption(selectedOption ?? 0)

  const [periodIndex, setPeriodIndex] = useState(defaultIndices.period)
  const [hourIndex, setHourIndex] = useState(defaultIndices.hour)
  const [minuteIndex, setMinuteIndex] = useState(defaultIndices.minute)

  // selectedOption이나 selectedTime이 변경될 때 인덱스 설정
  useEffect(() => {
    if (selectedTime) {
      const parsed = parseTimeToIndices(selectedTime)
      if (parsed) {
        setPeriodIndex(parsed.period)
        setHourIndex(parsed.hour)
        setMinuteIndex(parsed.minute)
        return
      }
    }

    if (selectedOption !== undefined) {
      const defaults = getDefaultIndicesByOption(selectedOption)
      setPeriodIndex(defaults.period)
      setHourIndex(defaults.hour)
      setMinuteIndex(defaults.minute)
    }
  }, [selectedTime, selectedOption])

  // 시간 확인 버튼 클릭 시
  const confirmTime = useCallback(() => {
    const period = PERIOD_OPTIONS[periodIndex].label
    const hour = HOUR_OPTIONS[hourIndex].label
    const minute = MINUTE_OPTIONS[minuteIndex].label

    const formattedTime = `${hour}:${minute} ${period}`
    onConfirm(formattedTime)
    onClose()
  }, [periodIndex, hourIndex, minuteIndex, onConfirm, onClose])

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.modalContainer}>
        {/* 배경 오버레이 */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* 컨텐츠 영역 */}
        <View style={styles.contentContainer}>
          <BlurView
            intensity={80}
            style={styles.modalBlur}>
            <View style={styles.drawerHandleContainer}>
              <View style={styles.drawerHandle} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{WHEN_OPTIONS[selectedOption ?? 0].label}</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButtonContainer}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 3개의 휠 피커 */}
            <View style={styles.pickerContainer}>
              {/* 오전/오후 */}
              <View style={styles.wheelWrapper}>
                <WheelPicker
                  value={periodIndex}
                  data={PERIOD_OPTIONS}
                  onValueChanged={(event) => setPeriodIndex(event.item.value)}
                  itemHeight={48}
                  visibleItemCount={5}
                  itemTextStyle={styles.wheelItemText}
                  overlayItemStyle={{
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                />
              </View>

              {/* 시간 */}
              <View style={styles.wheelWrapper}>
                <WheelPicker
                  value={hourIndex}
                  data={HOUR_OPTIONS}
                  onValueChanged={(event) => setHourIndex(event.item.value)}
                  itemHeight={48}
                  visibleItemCount={5}
                  itemTextStyle={styles.wheelItemText}
                  overlayItemStyle={{ borderRadius: 0 }}
                />
              </View>

              {/* 분 */}
              <View style={styles.wheelWrapper}>
                <WheelPicker
                  value={minuteIndex}
                  data={MINUTE_OPTIONS}
                  onValueChanged={(event) => setMinuteIndex(event.item.value)}
                  itemHeight={48}
                  visibleItemCount={5}
                  itemTextStyle={styles.wheelItemText}
                  overlayItemStyle={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmTime}>
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  modalBlur: {
    padding: 24,
    paddingBottom: 40,
  },
  drawerHandleContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  drawerHandle: {
    width: 60,
    height: 3,
    backgroundColor: Colors.onboardingDrawerHandle,
    borderRadius: 1.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
  },
  closeButtonContainer: {
    opacity: 0.7,
    padding: 4,
  },
  closeButton: {
    fontSize: 24,
  },
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelWrapper: {
    flex: 1,
    height: 200,
  },
  wheelContainer: {
    backgroundColor: 'transparent',
  },
  wheelItemText: {
    fontSize: 22,
    color: Colors.black,
    textAlign: 'center',
  },
  selectedItemText: {
    fontSize: 22,
    color: Colors.black,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedIndicator: {
    // backgroundColor: Colors.onboardingTimeInputBg,
    // borderRadius: 12,
    // marginHorizontal: 8,
  },
  confirmButton: {
    backgroundColor: Colors.onboardingPrimary,
    borderRadius: 200,
    padding: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
})
