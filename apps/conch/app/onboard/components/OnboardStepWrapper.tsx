import React, { ReactNode } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors } from '@conch/assets/colors'
import { PrimaryButton } from '@conch/components'
import { NavigationArrowLeft } from '@conch/assets/icons'

// 진행 단계 인터페이스
export interface StepIndicatorProps {
  totalSteps: number
  currentStep: number
}

// 온보딩 단계 헤더 인터페이스
export interface StepHeaderProps {
  emoji: string
  title: string
  subtitle: string
  reverse?: boolean // title과 subtitle의 순서를 반대로 할지 여부
}

// 온보딩 스텝 랩퍼 props 인터페이스
export interface OnboardStepWrapperProps {
  stepIndicator: StepIndicatorProps
  header: StepHeaderProps
  children: ReactNode
  buttonText: string
  onButtonPress: () => void
  buttonDisabled?: boolean
  onPrevPress?: () => void // 뒤로가기 버튼 클릭 핸들러
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
  )
}

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
  )
}

// 온보딩 단계 랩퍼 컴포넌트
const OnboardStepWrapper = ({
  stepIndicator,
  header,
  children,
  buttonText,
  onButtonPress,
  buttonDisabled = false,
  onPrevPress,
}: OnboardStepWrapperProps) => {
  return (
    <ScrollView style={styles.habitSettingContainer}>
      {/* 상단 네비게이션 영역 */}
      <View style={styles.navigationContainer}>
        {/* 뒤로가기 버튼 */}
        {onPrevPress && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onPrevPress}
          >
            <NavigationArrowLeft color={Colors.lightGrey} />
          </TouchableOpacity>
        )}
        
        {/* 프로그레스 바 */}
        <StepIndicator
          totalSteps={stepIndicator.totalSteps}
          currentStep={stepIndicator.currentStep}
        />
      </View>
      
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
  )
}

const styles = StyleSheet.create({
  habitSettingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.bgGrey,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  progressDot: {
    width: 50,
    height: 3,
    borderRadius: 3,
    backgroundColor: Colors.lightGrey,
  },
  progressDotActive: {
    backgroundColor: '#F9842A',
  },
  habitHeaderContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  habitEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },
  habitTitleContainer: {
    alignItems: 'center',
  },
  habitTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9842A',
    textAlign: 'center',
  },
  habitSubtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.writtenGrey,
    textAlign: 'center',
  },
  contentContainer: {
    marginTop: 20,
    flexGrow: 1,
  },
  buttonContainer: {
    marginVertical: 30,
  },
  nextButton: {
    width: '100%',
  },
})

export default OnboardStepWrapper 