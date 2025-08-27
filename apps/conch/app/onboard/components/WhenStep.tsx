import React, { useState, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { OnboardStepComponentProps, WhenPreference, whenOptions } from './types'
import OnboardStepWrapper from './OnboardStepWrapper'
import OptionCard from './OptionCard'
import TimePicker from './TimePicker'

const WhenStep = ({ data, onDataChange, onNext, onPrev }: OnboardStepComponentProps<WhenPreference>) => {
  const [selectedOption, setSelectedOption] = useState<string>(data.optionId || '')
  const [customValue, setCustomValue] = useState<string>(data.customValue || '')
  const [timePickerVisible, setTimePickerVisible] = useState<boolean>(false)
  const [selectedTime, setSelectedTime] = useState<string>(data.customValue || '')

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
    
    // 부모 컴포넌트에 데이터 업데이트
    onDataChange({
      optionId: selectedOption,
      customValue: time,
    })
    
    // 자동으로 다음 단계로 이동
    onNext()
  }, [selectedOption, onDataChange, onNext])

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