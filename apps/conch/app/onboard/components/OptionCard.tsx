import React from 'react'
import { Pressable, Text, TextInput, StyleSheet } from 'react-native'
import { Colors } from '@conch/assets/colors'
import { HabitOption } from './types'

interface OptionCardProps {
  option: HabitOption
  isSelected: boolean
  customValue?: string
  onSelect: (optionId: string) => void
  onCustomValueChange?: (value: string) => void
}

const OptionCard = ({
  option,
  isSelected,
  customValue,
  onSelect,
  onCustomValueChange,
}: OptionCardProps) => {
  const isCustomSelected = isSelected && option.isCustom

  return (
    <Pressable
      key={option.id}
      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
      onPress={() => onSelect(option.id)}
    >
      <Text style={[
        styles.optionText, 
        option.isCustom && styles.optionTextCustom,
        isSelected && styles.optionTextSelected
      ]}>
        {option.text}
      </Text>
      {isCustomSelected && onCustomValueChange && (
        <TextInput
          style={styles.customInput}
          placeholder="입력하세요"
          value={customValue}
          onChangeText={onCustomValueChange}
        />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  optionCardSelected: {
    borderWidth: 1.5,
    borderColor: Colors.onboardingCardBorder,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.onboardingTextDefault,
  },
  optionTextSelected: {
    color: Colors.onboardingTextDefault,
  },
  optionTextCustom: {
    color: Colors.lightGrey,
  },
  customInput: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
    paddingVertical: 5,
  },
})

export default OptionCard 