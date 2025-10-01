import React, { useState, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { OnboardStepComponentProps, WhenPreference, whenOptions } from './types'
import OnboardStepWrapper from './OnboardStepWrapper'
import OptionCard from './OptionCard'
import TimePicker from './TimePicker'

// 'h:mm 오전/오후' -> 'HH:mm'
function to24Hour(timeKo: string): string {
  const [timePart, period] = (timeKo || '').split(' ')
  if (!timePart || !period) return ''
  const [hourPart, minutePart] = timePart.split(':')
  let hour = parseInt(hourPart, 10)
  const minute = parseInt(minutePart, 10)
  if (period === '오후' && hour < 12) hour += 12
  if (period === '오전' && hour === 12) hour = 0
  const HH = String(hour).padStart(2, '0')
  const MM = String(minute).padStart(2, '0')
  return `${HH}:${MM}`
}

// 'HH:mm' -> 'h:mm 오전/오후'
function from24hToKo(time24: string): string {
  if (!time24) return ''
  const [HH, MM] = time24.split(':')
  let hour = parseInt(HH, 10)
  const minute = parseInt(MM, 10)
  let period = '오전'
  if (hour >= 12) {
    period = '오후'
    hour = hour === 12 ? 12 : hour - 12
  } else {
    hour = hour === 0 ? 12 : hour
  }
  const minuteStr = minute < 10 ? `0${minute}` : `${minute}`
  return `${hour}:${minuteStr} ${period}`
}

const WhenStep = ({ data, onDataChange, onNext, onPrev }: OnboardStepComponentProps<WhenPreference>) => {
  const [selectedOption, setSelectedOption] = useState<string>(data.optionId || '')
  const [customValue, setCustomValue] = useState<string>(data.customValue || '')
  const [timePickerVisible, setTimePickerVisible] = useState<boolean>(false)
  const [selectedTime, setSelectedTime] = useState<string>(data.time ? from24hToKo(data.time) : data.customValue || '')

  // 옵션 선택 핸들러
  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOption(optionId)
    
    // 모든 옵션 선택 시 시간 선택 모달 표시
    setTimePickerVisible(true)
    
    // 부모 컴포넌트에 데이터 업데이트
    onDataChange({
      optionId,
      customValue: optionId === 'custom' ? customValue : undefined,
    })
  }, [customValue, onDataChange])

  // 커스텀 입력값 변경 핸들러
  const handleCustomValueChange = useCallback((value: string) => {
    setCustomValue(value)
    
    // 부모 컴포넌트에 데이터 업데이트
    if (selectedOption === 'custom') {
      onDataChange({
        optionId: selectedOption,
        customValue: value,
      })
    }
  }, [selectedOption, onDataChange])

  // 시간 선택 확인 핸들러 - 선택 완료 후 자동으로 다음 단계로 이동
  const handleTimeConfirm = useCallback((time: string) => {
    setCustomValue(time)
    setSelectedTime(time)
    
    // 부모 컴포넌트에 데이터 업데이트
    onDataChange({
      optionId: selectedOption,
      customValue: selectedOption === 'custom' ? time : undefined,
      time: to24Hour(time),
    })
    
    // 자동으로 다음 단계로 이동
    onNext()
  }, [selectedOption, onDataChange, onNext, to24Hour])

  return (
    <>
      <OnboardStepWrapper
        stepIndicator={{ totalSteps: 3, currentStep: 1 }}
        header={{
          emoji: '⏰',
          title: '매일 ‘언제’',
          subtitle: '회고를 작성할거야?',
          reverse: false,
        }}
        buttonText="다음"
        onButtonPress={onNext}
        buttonDisabled={true} // 다음 버튼 비활성화 (타임피커로만 진행)
        hideButton={true} // 다음 버튼 숨김
        onPrevPress={onPrev}
      >
        <View style={styles.optionsContainer}>
          {whenOptions.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              isSelected={selectedOption === option.id}
              customValue={customValue}
              onSelect={handleOptionSelect}
            />
          ))}
        </View>
      </OnboardStepWrapper>
      
      <TimePicker
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onConfirm={handleTimeConfirm}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        selectedOption={selectedOption}
      />
    </>
  )
}

const styles = StyleSheet.create({
  optionsContainer: {
    gap: 16,
    paddingHorizontal: 8,
  },
})

export default WhenStep 