import React, { useState, useCallback, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { StreakReq } from '@api/conch/types/conchApi'
import { OnboardStepComponentProps, WHERE_OPTIONS } from './types'
import OnboardStepWrapper from './OnboardStepWrapper'
import OptionCard from './OptionCard'

function WhereStep({ data, onDataChange, onNext, onPrev }: OnboardStepComponentProps<StreakReq['writeLocation']>) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0)
  const [customValue, setCustomValue] = useState<string>(data || '')
  const selectedOption = WHERE_OPTIONS[selectedOptionIndex]

  // 옵션 선택 핸들러
  const handleOptionSelect = useCallback((optionId: number) => {
    const option = WHERE_OPTIONS[optionId]
    setSelectedOptionIndex(optionId)
    
    // 부모 컴포넌트에 데이터 업데이트
    onDataChange(option.isCustom ? customValue : option.value)
  }, [customValue, onDataChange])

  // 커스텀 입력값 변경 핸들러
  const handleCustomValueChange = useCallback((value: string) => {
    setCustomValue(value)
    
    // 부모 컴포넌트에 데이터 업데이트
    if (WHERE_OPTIONS[selectedOptionIndex].isCustom) {
      onDataChange(value)
    }
  }, [selectedOptionIndex, onDataChange])

  // 버튼 비활성화 여부
  const isButtonDisabled = useMemo(() => !Number.isInteger(selectedOptionIndex) || (selectedOption.isCustom && !customValue), [selectedOptionIndex, selectedOption.isCustom, customValue])

  return (
    <OnboardStepWrapper
      stepIndicator={{ totalSteps: 3, currentStep: 2 }}
      header={{
        emoji: '📍',
        title: '매일 ‘어디서’',
        subtitle: '회고를 작성할거야?',
        reverse: false,
      }}
      buttonText="다음"
      onButtonPress={onNext}
      buttonDisabled={isButtonDisabled}
      onPrevPress={onPrev}
    >
      <View style={styles.optionsContainer}>
        {WHERE_OPTIONS.map((option, index) => (
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

export default WhereStep 