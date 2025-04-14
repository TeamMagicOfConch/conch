import React, { useState, useCallback, useEffect } from 'react'
import { SafeAreaView } from 'react-native'
import { register, setTokens } from '@conch/utils'
import { 
  InitialInfoStep, 
  WhenStep, 
  WhereStep, 
  GoalStep,
  OnboardStep,
  OnboardingData,
  UserInfo,
  WhenPreference,
  WherePreference,
  GoalPreference
} from './components'

interface OnboardScreenProps {
  setNeedOnboard: React.Dispatch<React.SetStateAction<boolean>>
  onLayout: () => void
}

const OnboardScreen = ({ setNeedOnboard, onLayout }: OnboardScreenProps) => {
  // 현재 온보딩 단계
  const [currentStep, setCurrentStep] = useState<OnboardStep>(OnboardStep.INITIAL_INFO)
  
  // 온보딩 데이터
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userInfo: {
      username: '',
      initialReviewCount: undefined,
    },
    whenPreference: {
      optionId: '',
    },
    wherePreference: {
      optionId: '',
    },
    goalPreference: {
      optionId: '',
    },
  })

  // 사용자 정보 업데이트
  const updateUserInfo = useCallback((data: UserInfo) => {
    setOnboardingData(prev => ({
      ...prev,
      userInfo: data,
    }))
  }, [])

  // 시간 선택 정보 업데이트
  const updateWhenPreference = useCallback((data: WhenPreference) => {
    setOnboardingData(prev => ({
      ...prev,
      whenPreference: data,
    }))
  }, [])

  // 장소 선택 정보 업데이트
  const updateWherePreference = useCallback((data: WherePreference) => {
    setOnboardingData(prev => ({
      ...prev,
      wherePreference: data,
    }))
  }, [])

  // 목표 선택 정보 업데이트
  const updateGoalPreference = useCallback((data: GoalPreference) => {
    setOnboardingData(prev => ({
      ...prev,
      goalPreference: data,
    }))
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
      const {
        data: { accessToken = null, refreshToken = null, username: usernameRes = null } = {},
      } = response || {}
      
      if (accessToken && refreshToken && username) {
        setTokens({ accessToken, refreshToken, username: usernameRes })
        goToNextStep()
      }
    } catch (error) {
      console.error('회원가입 에러:', error)
    }
  }, [onboardingData.userInfo])

  // 마지막 단계에서 모든 정보 등록 및 앱으로 이동
  const completeOnboarding = useCallback(async () => {
    // TODO: 서버에 습관 설정 정보 저장 로직 추가
    console.log('최종 온보딩 데이터:', {
      when: getWhenValue(),
      where: getWhereValue(),
      goal: getGoalValue(),
    })
    
    setNeedOnboard(false)
  }, [onboardingData, setNeedOnboard])

  // 다음 단계로 이동
  const goToNextStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev === OnboardStep.COMPLETED) {
        return prev
      }
      return prev + 1
    })
  }, [])

  // 이전 단계로 이동
  const goToPrevStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev === OnboardStep.INITIAL_INFO) {
        return prev
      }
      return prev - 1
    })
  }, [])

  // 선택한 옵션의 텍스트 값 반환 헬퍼 함수들
  const getWhenValue = useCallback(() => {
    const { optionId, customValue } = onboardingData.whenPreference
    if (optionId === 'custom' && customValue) {
      return customValue
    }
    return optionId
  }, [onboardingData.whenPreference])

  const getWhereValue = useCallback(() => {
    const { optionId, customValue } = onboardingData.wherePreference
    if (optionId === 'custom' && customValue) {
      return customValue
    }
    return optionId
  }, [onboardingData.wherePreference])

  const getGoalValue = useCallback(() => {
    const { optionId, customValue } = onboardingData.goalPreference
    if (optionId === 'custom' && customValue) {
      return customValue
    }
    return optionId
  }, [onboardingData.goalPreference])

  // 현재 단계에 맞는 컴포넌트 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case OnboardStep.INITIAL_INFO:
        return (
          <InitialInfoStep
            data={onboardingData.userInfo}
            onDataChange={updateUserInfo}
            onNext={handleInitialInfoSubmit}
          />
        )
      case OnboardStep.WHEN:
        return (
          <WhenStep
            data={onboardingData.whenPreference}
            onDataChange={updateWhenPreference}
            onNext={goToNextStep}
            onPrev={goToPrevStep}
          />
        )
      case OnboardStep.WHERE:
        return (
          <WhereStep
            data={onboardingData.wherePreference}
            onDataChange={updateWherePreference}
            onNext={goToNextStep}
            onPrev={goToPrevStep}
          />
        )
      case OnboardStep.GOAL:
        return (
          <GoalStep
            data={onboardingData.goalPreference}
            onDataChange={updateGoalPreference}
            onNext={completeOnboarding}
            onPrev={goToPrevStep}
          />
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView
      onLayout={onLayout}
      style={{ flex: 1 }}
    >
      {renderStep()}
    </SafeAreaView>
  )
}

export default OnboardScreen 