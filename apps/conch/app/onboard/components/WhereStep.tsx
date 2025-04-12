import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardStepComponentProps, WherePreference, whereOptions } from './types';
import OnboardStepWrapper from './OnboardStepWrapper';
import OptionCard from './OptionCard';

const WhereStep = ({ data, onDataChange, onNext }: OnboardStepComponentProps<WherePreference>) => {
  const [selectedOption, setSelectedOption] = useState<string>(data.optionId || '');
  const [customValue, setCustomValue] = useState<string>(data.customValue || '');

  // 옵션 선택 핸들러
  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOption(optionId);
    
    // 부모 컴포넌트에 데이터 업데이트
    onDataChange({
      optionId,
      customValue: optionId === 'custom' ? customValue : undefined,
    });
  }, [customValue, onDataChange]);

  // 커스텀 입력값 변경 핸들러
  const handleCustomValueChange = useCallback((value: string) => {
    setCustomValue(value);
    
    // 부모 컴포넌트에 데이터 업데이트
    if (selectedOption === 'custom') {
      onDataChange({
        optionId: selectedOption,
        customValue: value,
      });
    }
  }, [selectedOption, onDataChange]);

  // 버튼 비활성화 여부
  const isButtonDisabled = useMemo(() => {
    return !selectedOption || (selectedOption === 'custom' && !customValue);
  }, [selectedOption, customValue]);

  return (
    <OnboardStepWrapper
      stepIndicator={{ totalSteps: 3, currentStep: 2 }}
      header={{
        emoji: '📍',
        title: "매일 '어디서'",
        subtitle: '회고를 작성할거야?',
        reverse: false,
      }}
      buttonText="다음"
      onButtonPress={onNext}
      buttonDisabled={isButtonDisabled}
    >
      <View style={styles.optionsContainer}>
        {whereOptions.map((option) => (
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
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    gap: 16,
  },
});

export default WhereStep; 