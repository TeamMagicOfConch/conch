import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@conch/assets/colors';
import { PrimaryButton } from '@conch/components';

// 진행 단계 인터페이스
export interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

// 온보딩 단계 헤더 인터페이스
export interface StepHeaderProps {
  emoji: string;
  title: string;
  subtitle: string;
  reverse?: boolean; // title과 subtitle의 순서를 반대로 할지 여부
}

// 온보딩 스텝 랩퍼 props 인터페이스
export interface OnboardStepWrapperProps {
  stepIndicator: StepIndicatorProps;
  header: StepHeaderProps;
  children: ReactNode;
  buttonText: string;
  onButtonPress: () => void;
  buttonDisabled?: boolean;
}

// 진행 단계 표시기 컴포넌트
export const StepIndicator = ({ totalSteps, currentStep }: StepIndicatorProps) => {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index < currentStep ? styles.progressDotActive : null,
          ]}
        />
      ))}
    </View>
  );
};

// 온보딩 단계 헤더 컴포넌트
export const StepHeader = ({ emoji, title, subtitle, reverse = false }: StepHeaderProps) => {
  return (
    <View style={styles.habitHeaderContainer}>
      <Text style={styles.habitEmoji}>{emoji}</Text>
      <View style={styles.habitTitleContainer}>
        {reverse ? (
          <>
            <Text style={styles.habitSubtitle}>{subtitle}</Text>
            <Text style={styles.habitTitle}>{title}</Text>
          </>
        ) : (
          <>
            <Text style={styles.habitTitle}>{title}</Text>
            <Text style={styles.habitSubtitle}>{subtitle}</Text>
          </>
        )}
      </View>
    </View>
  );
};

// 온보딩 단계 랩퍼 컴포넌트
const OnboardStepWrapper = ({
  stepIndicator,
  header,
  children,
  buttonText,
  onButtonPress,
  buttonDisabled = false,
}: OnboardStepWrapperProps) => {
  return (
    <ScrollView style={styles.habitSettingContainer}>
      <StepIndicator
        totalSteps={stepIndicator.totalSteps}
        currentStep={stepIndicator.currentStep}
      />
      <StepHeader
        emoji={header.emoji}
        title={header.title}
        subtitle={header.subtitle}
        reverse={header.reverse}
      />
      <View style={styles.contentContainer}>{children}</View>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          disabled={buttonDisabled}
          onPress={onButtonPress}
          style={styles.nextButton}
        >
          {buttonText}
        </PrimaryButton>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  habitSettingContainer: {
    flex: 1,
    backgroundColor: Colors.bgGrey,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    gap: 8,
  },
  progressDot: {
    width: 50,
    height: 3,
    backgroundColor: Colors.grey,
    borderRadius: 3,
  },
  progressDotActive: {
    backgroundColor: '#F9842A',
  },
  habitHeaderContainer: {
    alignItems: 'center',
    padding: 28,
    gap: 28,
  },
  habitEmoji: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  habitTitleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  habitTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.writtenGrey,
    textAlign: 'center',
  },
  habitSubtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.lightGrey,
    textAlign: 'center',
  },
  contentContainer: {
    padding: 28,
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#F9842A',
    width: '100%',
  },
});

export default OnboardStepWrapper; 