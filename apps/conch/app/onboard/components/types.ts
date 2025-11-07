// 온보딩 단계 enum
export enum OnboardStep {
  INITIAL_INFO = 0,
  WHEN = 1,
  WHERE = 2,
  GOAL = 3,
  COMPLETED = 4,
}

// 옵션 인터페이스
export interface HabitOption {
  /** @not-used */
  id: string
  label?: string
  value: string
  isCustom?: boolean
}

// 시간 선택 옵션
export const WHEN_OPTIONS: HabitOption[] = [
  { id: 'after_work', label: '퇴근 직후', isCustom: false, value: '18:30' },
  { id: 'before_sleep', label: '잠들기 직전', isCustom: false, value: '23:00' },
  { id: 'after_dinner', label: '저녁 식사 후', isCustom: false, value: '19:00' },
  { id: 'custom', label: '직접 입력', isCustom: true, value: '18:00' },
]

// 장소 선택 옵션
export const WHERE_OPTIONS: HabitOption[] = [
  { id: 'in_bed', label: '침대에서', value: '침대에서' },
  { id: 'at_desk', label: '책상 앞에서', value: '책상 앞에서' },
  { id: 'on_commute', label: '퇴근길 대중교통에서', value: '퇴근길 대중교통에서' },
  { id: 'custom', label: '직접 입력', isCustom: true, value: '직접 입력' },
]

// 목표 선택 옵션
export const GOAL_OPTIONAS: HabitOption[] = [
  { id: 'understand_self', label: '나 자신을 깊이 이해하는 사람', value: '나 자신을 깊이 이해하는 사람' },
  { id: 'improve_daily', label: '매일 조금씩 더 나아지는 사람', value: '매일 조금씩 더 나아지는 사람' },
  { id: 'organize_thoughts', label: '감정과 생각을 조화롭게 정리하는 사람', value: '감정과 생각을 조화롭게 정리하는 사람' },
  { id: 'custom', label: '직접 입력', isCustom: true, value: '직접 입력' },
]

// 각 온보딩 컴포넌트 공통 props 인터페이스
export interface OnboardStepComponentProps<T> {
  data: T
  onDataChange: (data: T) => void
  onNext: () => void
  onPrev?: () => void
}

// 시간대 설정을 위한 props
export interface TimePickerProps {
  visible: boolean
  onClose: () => void
  onConfirm: (time: string) => void
  selectedTime: string
  setSelectedTime: (time: string) => void
  selectedOption?: number // 선택된 옵션 index
}

// 온보딩 기본값
export const DEFAULT_ONBOARDING_DATA = {
  reviewAt: WHEN_OPTIONS[0].value,      // '18:30'
  writeLocation: WHERE_OPTIONS[0].value, // '침대에서'
  aspiration: GOAL_OPTIONAS[0].value,   // '나 자신을 깊이 이해하는 사람'
} 