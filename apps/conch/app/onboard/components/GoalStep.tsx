import React, { useState, useCallback, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { StreakReq } from '@api/conch/types/conchApi'
import { OnboardStepComponentProps, GOAL_OPTIONAS } from './types'
import OnboardStepWrapper from './OnboardStepWrapper'
import OptionCard from './OptionCard'

function GoalStep({ data, onDataChange, onNext, onPrev }: OnboardStepComponentProps<StreakReq['aspiration']>) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0)
  const [customValue, setCustomValue] = useState<string>(data || '')
  const selectedOption = GOAL_OPTIONAS[selectedOptionIndex]

  // 옵션 선택 핸들러
  const handleOptionSelect = useCallback((optionId: number) => {
    const option = GOAL_OPTIONAS[optionId]
    setSelectedOptionIndex(optionId)
    
    // 부모 컴포넌트에 데이터 업데이트
    onDataChange(option.isCustom ? customValue : option.value)
  }, [customValue, onDataChange])

  // 커스텀 입력값 변경 핸들러
  const handleCustomValueChange = useCallback((value: string) => {
    setCustomValue(value)
    
    // 부모 컴포넌트에 데이터 업데이트
    if (selectedOption.isCustom) {
      onDataChange(customValue)
    }
  }, [selectedOption.isCustom, onDataChange, customValue])

  // 버튼 비활성화 여부
  const isButtonDisabled = useMemo(() => !Number.isInteger(selectedOptionIndex) || (selectedOption.isCustom && !customValue), [selectedOptionIndex, selectedOption.isCustom, customValue])

  return (
    <OnboardStepWrapper
      stepIndicator={{ totalSteps: 3, currentStep: 3 }}
      header={{
        emoji: '💭',
        title: '‘어떤 사람이’ 되고 싶어?',
        subtitle: '매일 회고를 작성하며',
        reverse: true,
      }}
      buttonText="회고 약속 만들기"
      onButtonPress={onNext}
      buttonDisabled={isButtonDisabled}
      onPrevPress={onPrev}
    >
      <View style={styles.optionsContainer}>
        {GOAL_OPTIONAS.map((option, index) => (
          <OptionCard
            index={index}
            key={option.id}
            option={option}
            isSelected={selectedOptionIndex === index}
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