import { useEffect, useState } from 'react'
import { UNREGISTERED_CODE, NEED_MORE_ONBOARDING_CODE } from '@api/conch'
import { login, setTokens } from '@conch/utils/api'
import { OnboardStep } from './onboard/components'

export function useStartUp() {
  const [isAppReady, setIsAppReady] = useState(false)
  const [error, setError] = useState<any>(null)
  const [needOnboard, setNeedOnboard] = useState(true)
  const [initialOnboardStep, setInitialOnboardStep] = useState<OnboardStep>(OnboardStep.INITIAL_INFO)

  useEffect(() => {
    async function prepare() {
      try {
        if (process.env.EXPO_PUBLIC_FORCE_ONBOARDING === 'true') {
          setNeedOnboard(true)
          const forcedStep = Number(process.env.EXPO_PUBLIC_ONBOARDING_START_STEP)
          if (!Number.isNaN(forcedStep) && forcedStep >= OnboardStep.INITIAL_INFO && forcedStep <= OnboardStep.GOAL) {
            setInitialOnboardStep(forcedStep as OnboardStep)
          } else {
            setInitialOnboardStep(OnboardStep.INITIAL_INFO)
          }
          setIsAppReady(true)
          return
        }

        const res = await login()
        const { code, data } = res
        console.log('code', code)

        if (code === NEED_MORE_ONBOARDING_CODE) {
          setNeedOnboard(true)
          setInitialOnboardStep(OnboardStep.WHEN)
        } else if (code === UNREGISTERED_CODE) {
          setNeedOnboard(true)
          setInitialOnboardStep(OnboardStep.INITIAL_INFO)
        } else {
          // 백엔드가 온보딩 시작 스텝을 내려줄 수 있도록 확장: data.onboardingStartStep (optional)
          const onboardingStartStep: number | undefined = (data as any)?.onboardingStartStep
          if (typeof onboardingStartStep === 'number' && onboardingStartStep >= OnboardStep.INITIAL_INFO && onboardingStartStep <= OnboardStep.GOAL) {
            setNeedOnboard(true)
            setInitialOnboardStep(onboardingStartStep as OnboardStep)
          } else {
            setNeedOnboard(false)
            const { accessToken, refreshToken, username } = data || {}
            await setTokens({ accessToken, refreshToken, username })
          }
        }

        setIsAppReady(true)
      } catch (e) {
        console.warn(e)
        setError(e)
        alert(e)
        setIsAppReady(true)
      }
    }

    prepare()
  }, [])

  return { isAppReady, needOnboard, setNeedOnboard, error, initialOnboardStep }
}
