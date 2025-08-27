import { useState, useEffect } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Modal, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { Colors } from '@conch/assets/colors'
import { TimePickerProps } from './types'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { DatePicker } from 'react-native-wheel-pick'

// 선택 옵션별 기본 시간값 설정
const DEFAULT_TIMES: Record<string, { hour: number; minute: number }> = {
  after_work: { hour: 18, minute: 30 }, // 오후 6시 30분
  before_sleep: { hour: 23, minute: 0 }, // 오후 11시 정각
  after_dinner: { hour: 19, minute: 0 }, // 오후 7시 정각
  custom: { hour: 18, minute: 0 }, // 오후 6시 정각
}

// 옵션에 따른 기본 시간 생성 함수
const getDefaultTimeByOption = (option: string): Date => {
  const defaultTime = DEFAULT_TIMES[option] || DEFAULT_TIMES.custom
  const date = new Date()
  // 24시간 형식으로 시간 설정
  date.setHours(defaultTime.hour, defaultTime.minute, 0)
  return date
}

// 커스텀 피커 구현 (react-native-wheel-pick 사용)
const CustomTimePicker = ({
  visible,
  onClose,
  onConfirm,
  selectedTime,
  selectedOption,
  setSelectedTime,
}: TimePickerProps) => {
  // 초기 시간값 설정
  const [initialTime, setInitialTime] = useState<Date>(getDefaultTimeByOption(selectedOption || 'custom'))

  // selectedOption이나 selectedTime이 변경될 때 초기 날짜 설정
  useEffect(() => {
    if (selectedTime) {
      // 이미 선택된 시간이 있으면 그 시간으로 설정
      const [timePart, periodPart] = selectedTime.split(' ')
      if (timePart && periodPart) {
        const [hourPart, minutePart] = timePart.split(':')
        
        const date = new Date()
        let hour = parseInt(hourPart, 10)
        
        // 오전/오후에 따라 시간 조정
        if (periodPart === '오후' && hour < 12) {
          hour += 12
        } else if (periodPart === '오전' && hour === 12) {
          hour = 0
        }
        
        date.setHours(hour)
        date.setMinutes(parseInt(minutePart, 10))
        date.setSeconds(0)
        
        setInitialTime(date)
      }
    } else if (selectedOption) {
      // 선택된 시간이 없으면 옵션에 따른 기본값 설정
      setInitialTime(getDefaultTimeByOption(selectedOption))
    }
  }, [selectedTime, selectedOption])

  // 시간 확인 버튼 클릭 시
  const confirmTime = () => {
    // Date 객체에서 시간, 분, 오전/오후 추출
    const hours = initialTime.getHours()
    const minutes = initialTime.getMinutes()
    
    let period = '오전'
    let hour = hours
    
    if (hours >= 12) {
      period = '오후'
      hour = hours === 12 ? 12 : hours - 12
    } else {
      hour = hours === 0 ? 12 : hours
    }
    
    // 분이 한 자리 수일 경우 앞에 0 추가
    const minute = minutes < 10 ? `0${minutes}` : `${minutes}`
    
    const formattedTime = `${hour}:${minute} ${period}`
    onConfirm(formattedTime)
    onClose()
  }

  // 시간 변경 이벤트 핸들러
  const onTimeSelected = (date: Date) => {
    setInitialTime(date)
  }

  // 선택된 옵션에 따라 타이틀 텍스트 설정
  const getTitleText = () => {
    switch(selectedOption) {
      case 'after_work':
        return '퇴근 직후,'
      case 'before_sleep':
        return '잠들기 직전,'
      case 'after_dinner':
        return '저녁 식사 후,'
      case 'custom':
        return '시간 선택,'
      default:
        return '시간 선택,'
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
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
          <BlurView intensity={80} style={styles.modalBlur}>
            <View style={styles.drawerHandleContainer}>
              <View style={styles.drawerHandle} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getTitleText()}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerContainer}>
              {/* wheel-picker를 사용한 시간 선택기 */}
              <DatePicker
                locale="ko_KR"
                date={initialTime}
                onDateChange={onTimeSelected}
                textSize={26}
                textColor="#000000"
                itemTextColor="#00000055"
                style={styles.wheelPicker}
                mode="time"
              />
            </View>
            
            <TouchableOpacity style={styles.confirmButton} onPress={confirmTime}>
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </Modal>
  )
}

// 네이티브 피커 구현 (react-native-modal-datetime-picker 사용)
const NativeTimePicker = ({
  visible,
  onClose,
  onConfirm,
  selectedTime,
  selectedOption,
  setSelectedTime,
}: TimePickerProps) => {
  // 초기 시간값 설정
  const [initialDate, setInitialDate] = useState<Date>(getDefaultTimeByOption(selectedOption || 'custom'))
  // 피커 표시 여부
  const [showPicker, setShowPicker] = useState<boolean>(false)

  // selectedOption이나 selectedTime이 변경될 때 초기 날짜 설정
  useEffect(() => {
    if (selectedTime) {
      // 이미 선택된 시간이 있으면 그 시간으로 설정
      const [timePart, periodPart] = selectedTime.split(' ')
      if (timePart && periodPart) {
        const [hourPart, minutePart] = timePart.split(':')
        
        const date = new Date()
        let hour = parseInt(hourPart, 10)
        
        // 오전/오후에 따라 시간 조정
        if (periodPart === '오후' && hour < 12) {
          hour += 12
        } else if (periodPart === '오전' && hour === 12) {
          hour = 0
        }
        
        date.setHours(hour)
        date.setMinutes(parseInt(minutePart, 10))
        date.setSeconds(0)
        
        setInitialDate(date)
      }
    } else if (selectedOption) {
      // 선택된 시간이 없으면 옵션에 따른 기본값 설정
      setInitialDate(getDefaultTimeByOption(selectedOption))
    }
  }, [selectedTime, selectedOption])

  // 모달이 닫힐 때 피커도 같이 닫기
  useEffect(() => {
    if (!visible) {
      setShowPicker(false)
    }
  }, [visible])

  // 날짜 선택 확인 핸들러
  const handleConfirm = (date: Date) => {
    // 시간 형식 변환
    const hours = date.getHours()
    const minutes = date.getMinutes()
    
    let period = '오전'
    let hour = hours
    
    if (hours >= 12) {
      period = '오후'
      hour = hours === 12 ? 12 : hours - 12
    } else {
      hour = hours === 0 ? 12 : hours
    }
    
    // 분이 한 자리 수일 경우 앞에 0 추가
    const minute = minutes < 10 ? `0${minutes}` : `${minutes}`
    
    const formattedTime = `${hour}:${minute} ${period}`
    setShowPicker(false)
    onConfirm(formattedTime)
  }

  // 피커 취소 핸들러
  const handleCancel = () => {
    setShowPicker(false)
  }

  // 선택된 옵션에 따라 타이틀 텍스트 설정
  const getTitleText = () => {
    switch(selectedOption) {
      case 'after_work':
        return '퇴근 직후,'
      case 'before_sleep':
        return '잠들기 직전,'
      case 'after_dinner':
        return '저녁 식사 후,'
      case 'custom':
        return '시간 선택,'
      default:
        return '시간 선택,'
    }
  }

  // 현재 선택된 시간 포맷팅
  const getFormattedTime = () => {
    if (selectedTime) return selectedTime
    
    const hours = initialDate.getHours()
    const minutes = initialDate.getMinutes()
    
    let period = '오전'
    let hour = hours
    
    if (hours >= 12) {
      period = '오후'
      hour = hours === 12 ? 12 : hours - 12
    } else {
      hour = hours === 0 ? 12 : hours
    }
    
    const minute = minutes < 10 ? `0${minutes}` : `${minutes}`
    
    return `${hour}:${minute} ${period}`
  }

  return (
    <>
      {/* 모달 창 */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
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
            <BlurView intensity={80} style={styles.modalBlur}>
              <View style={styles.drawerHandleContainer}>
                <View style={styles.drawerHandle} />
              </View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{getTitleText()}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {/* 시간 선택 인풋 영역 */}
              <TouchableOpacity 
                style={styles.timeInputContainer} 
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.timeInputText}>{getFormattedTime()}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </View>
      </Modal>
      
      {/* 시간 선택 모달 */}
      <DateTimePickerModal
        isVisible={showPicker}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        date={initialDate}
        display="spinner"
        themeVariant="light"
        confirmTextIOS="확인"
        cancelTextIOS="취소"
        buttonTextColorIOS="#F9842A"
        locale="ko_KR" // 한국어 로케일 설정
      />
    </>
  )
}

// 메인 TimePicker 컴포넌트 - 환경변수나 플랫폼에 따라 적절한 구현을 선택
const TimePicker = (props: TimePickerProps) => {
  // 아래 코드에서 환경변수를 사용하여 피커 타입을 선택할 수 있습니다
  // 기본적으로는 안드로이드에서는 네이티브 피커, iOS에서는 커스텀 피커를 사용합니다
  // 추후 환경변수를 활용해 전환할 수 있습니다
  return Platform.OS === 'android' 
    ? <NativeTimePicker {...props} />
    : <CustomTimePicker {...props} />
}

// 커스텀 피커용 스타일
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
    position: 'relative',
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // 오버플로우 숨기기
  },
  wheelPicker: {
    width: '100%',
    height: 180,
    backgroundColor: 'transparent',
  },
  wheelPickerItem: {
    height: 48,
  },
  confirmButton: {
    backgroundColor: Colors.onboardingPrimary,
    borderRadius: 200,
    padding: 16, // 패딩 증가
    alignItems: 'center',
    marginTop: 40,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeInputContainer: {
    backgroundColor: Colors.onboardingTimeInputBg,
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInputText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
})

// 네이티브 피커용 스타일
const nativeStyles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    bottom: 320, // 피커 위에 표시되도록 조정
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  closeButtonContainer: {
    opacity: 0.7,
    padding: 4,
  },
  closeButton: {
    fontSize: 24,
  },
})

export default TimePicker 