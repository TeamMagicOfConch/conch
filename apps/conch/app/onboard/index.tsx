import React, { useState, useCallback, useRef } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { registerOnboarding } from '@conch/utils'
import { RegisterReq, StreakReq } from '@api/conch/types/conchApi'
import { InitialInfoStep, WhenStep, WhereStep, GoalStep, OnboardStep, DEFAULT_ONBOARDING_DATA } from './components'

interface OnboardScreenProps {
  setNeedOnboard: React.Dispatch<React.SetStateAction<boolean>>
  onLayout: () => void
  initialStep?: OnboardStep
}

function OnboardScreen({ setNeedOnboard, onLayout, initialStep = OnboardStep.INITIAL_INFO }: OnboardScreenProps) {
  const initialStepRef = useRef<OnboardStep>(initialStep)
  const [currentStep, setCurrentStep] = useState<OnboardStep>(initialStepRef.current)

  // 온보딩 데이터
  const [registerData, setRegisterData] = useState<RegisterReq>({
    username: '',
    initialReviewCount: undefined,
  })
  const [onboardingData, setOnboardingData] = useState<StreakReq>({
    reviewTime: 'null', // deprecated
    ...DEFAULT_ONBOARDING_DATA,
  })

  // 온보딩 데이터 공통 업데이트 헬퍼
  const updateOnboarding = useCallback(<K extends keyof StreakReq>(key: keyof StreakReq, data: StreakReq[K]) => {
    setOnboardingData((prev) => ({
      ...prev,
      [key]: data,
    }))
  }, [])

  // 다음 단계로 이동
  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === OnboardStep.COMPLETED) {
        return prev
      }
      return prev + 1
    })
  }, [])

  // 마지막 단계에서 모든 정보 등록 및 앱으로 이동
  const completeOnboarding = useCallback(async () => {
    // TODO: 서버에 습관 설정 정보 저장 로직 추가
    const registerSucceed = await registerOnboarding(onboardingData)
    if (registerSucceed) {
      setNeedOnboard(false)
      router.replace('/(app)/(home)')
    }
  }, [onboardingData, setNeedOnboard])

  // 이전 단계로 이동
  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === initialStepRef.current) {
        return prev
      }
      return prev - 1
    })
  }, [])


  // 현재 단계에 맞는 컴포넌트 렌더링
  const renderStep = () => {
    const canGoBack = currentStep > initialStepRef.current
    switch (currentStep) {
      case OnboardStep.INITIAL_INFO:
        return (
          <InitialInfoStep
            data={registerData}
            onDataChange={(data) => setRegisterData(data)}
            onNext={goToNextStep}
          />
        )
      case OnboardStep.WHEN:
        return (
          <WhenStep
            data={onboardingData.reviewAt}
            onDataChange={(data) => updateOnboarding('reviewAt', data)}
            onNext={goToNextStep}
          />
        )
      case OnboardStep.WHERE:
        return (
          <WhereStep
            data={onboardingData.writeLocation}
            onDataChange={(data) => updateOnboarding('writeLocation', data)}
            onNext={goToNextStep}
            onPrev={canGoBack ? goToPrevStep : undefined}
          />
        )
      case OnboardStep.GOAL:
        return (
          <GoalStep
            data={onboardingData.aspiration}
            onDataChange={(data) => updateOnboarding('aspiration', data)}
            onNext={completeOnboarding}
            onPrev={canGoBack ? goToPrevStep : undefined}
          />
        )
      default:
        return null
    }
  }

  return (
    <View
      onLayout={onLayout}
      style={{ flex: 1 }}
    >
      {renderStep()}
    </View>
  )
}

export default OnboardScreen
