import React, { useState, useCallback, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { OnboardStepComponentProps, GoalPreference, goalOptions } from './types'
import OnboardStepWrapper from './OnboardStepWrapper'
import OptionCard from './OptionCard'

const GoalStep = ({ data, onDataChange, onNext, onPrev }: OnboardStepComponentProps<GoalPreference>) => {
  const [selectedOption, setSelectedOption] = useState<string>(data.optionId || '')
  const [customValue, setCustomValue] = useState<string>(data.customValue || '')

  // 옵션 선택 핸들러
  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOption(optionId)
    
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

  // 버튼 비활성화 여부
  const isButtonDisabled = useMemo(() => {
    return !selectedOption || (selectedOption === 'custom' && !customValue)
  }, [selectedOption, customValue])

  return (
    <OnboardStepWrapper
      stepIndicator={{ totalSteps: 3, currentStep: 3 }}
      header={{
        emoji: '💭',
        title: "'어떤 사람이' 되고 싶어?",
        subtitle: '매일 회고를 작성하며',
        reverse: true,
      }}
      buttonText="회고 약속 만들기"
      onButtonPress={onNext}
      buttonDisabled={isButtonDisabled}
      onPrevPress={onPrev}
    >
      <View style={styles.optionsContainer}>
        {goalOptions.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            isSelected={selectedOption === option.id}
            customValue={customValue}
            onSelect={handleOptionSelect}
            onCustomValueChange={option.isCustom ? handleCustomValueChange : undefined}
          />
        ))}
      </View>
    </OnboardStepWrapper>
  )
}

const styles = StyleSheet.create({
  optionsContainer: {
    gap: 16,
  },
})

export default GoalStep 