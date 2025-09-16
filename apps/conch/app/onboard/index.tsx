import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { register, setTokens } from '@conch/utils'
import { InitialInfoStep, WhenStep, WhereStep, GoalStep, OnboardStep, OnboardingData } from './components'

interface OnboardScreenProps {
  setNeedOnboard: React.Dispatch<React.SetStateAction<boolean>>
  onLayout: () => void
  initialStep?: OnboardStep
}

function OnboardScreen({ setNeedOnboard, onLayout, initialStep = OnboardStep.INITIAL_INFO }: OnboardScreenProps) {
  console.log('initialStep', initialStep)
  // 현재 온보딩 단계
  const initialStepRef = useRef<OnboardStep>(initialStep)
  const [currentStep, setCurrentStep] = useState<OnboardStep>(initialStepRef.current)

  // 온보딩 데이터
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userInfo: {
      username: '',
      initialReviewCount: undefined,
    },
    whenPreference: {
      optionId: '',
      time: undefined,
    },
    wherePreference: {
      optionId: '',
    },
    goalPreference: {
      optionId: '',
    },
  })

  // 온보딩 데이터 공통 업데이트 헬퍼
  const updateOnboarding = useCallback(<K extends keyof OnboardingData>(key: K, data: OnboardingData[K]) => {
    setOnboardingData((prev) => ({
      ...prev,
      [key]: data,
    }))
  }, [])

  // 마지막 단계에서 모든 정보 등록 및 앱으로 이동
  const completeOnboarding = useCallback(async () => {
    // TODO: 서버에 습관 설정 정보 저장 로직 추가
    console.log('최종 온보딩 데이터:', onboardingData)

    setNeedOnboard(false)
  }, [onboardingData, setNeedOnboard])

  // 다음 단계로 이동
  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === OnboardStep.COMPLETED) {
        return prev
      }
      return prev + 1
    })
  }, [])

  // 이전 단계로 이동
  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === initialStepRef.current) {
        return prev
      }
      return prev - 1
    })
  }, [])

  // 초기 정보 입력 후 사용자 등록 및 다음 단계로 이동
  const handleInitialInfoSubmit = useCallback(async () => {
    // 환경변수가 켜져있으면 register 스킵
    if (process.env.EXPO_PUBLIC_FORCE_ONBOARDING === 'true') {
      console.log('FORCE_ONBOARDING이 켜져있어 register를 스킵합니다.')
      goToNextStep()
      return
    }

    const { username, initialReviewCount } = onboardingData.userInfo

    try {
      const response = await register({ username, initialReviewCount })
      const { data: { accessToken = null, refreshToken = null, username: usernameRes = null } = {} } = response || {}

      if (accessToken && refreshToken && username) {
        setTokens({ accessToken, refreshToken, username: usernameRes })
        goToNextStep()
      }
    } catch (error) {
      console.error('회원가입 에러:', error)
    }
  }, [goToNextStep, onboardingData.userInfo])


  // 현재 단계에 맞는 컴포넌트 렌더링
  const renderStep = () => {
    const canGoBack = currentStep > initialStepRef.current
    switch (currentStep) {
      case OnboardStep.INITIAL_INFO:
        return (
          <InitialInfoStep
            data={onboardingData.userInfo}
            onDataChange={(data) => updateOnboarding('userInfo', data)}
            onNext={handleInitialInfoSubmit}
          />
        )
      case OnboardStep.WHEN:
        return (
          <WhenStep
            data={onboardingData.whenPreference}
            onDataChange={(data) => updateOnboarding('whenPreference', data)}
            onNext={goToNextStep}
            onPrev={canGoBack ? goToPrevStep : undefined}
          />
        )
      case OnboardStep.WHERE:
        return (
          <WhereStep
            data={onboardingData.wherePreference}
            onDataChange={(data) => updateOnboarding('wherePreference', data)}
            onNext={goToNextStep}
            onPrev={canGoBack ? goToPrevStep : undefined}
          />
        )
      case OnboardStep.GOAL:
        return (
          <GoalStep
            data={onboardingData.goalPreference}
            onDataChange={(data) => updateOnboarding('goalPreference', data)}
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
