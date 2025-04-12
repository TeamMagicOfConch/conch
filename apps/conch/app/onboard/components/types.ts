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
  id: string;
  text: string;
  isCustom?: boolean;
}

// 시간 선택 옵션
export const whenOptions: HabitOption[] = [
  { id: 'after_work', text: '퇴근 직후' },
  { id: 'before_sleep', text: '잠들기 직전' },
  { id: 'after_dinner', text: '저녁 식사 후' },
  { id: 'custom', text: '직접 입력', isCustom: true },
];

// 장소 선택 옵션
export const whereOptions: HabitOption[] = [
  { id: 'in_bed', text: '침대에서' },
  { id: 'at_desk', text: '책상 앞에서' },
  { id: 'on_commute', text: '퇴근길 대중교통에서' },
  { id: 'custom', text: '직접 입력', isCustom: true },
];

// 목표 선택 옵션
export const goalOptions: HabitOption[] = [
  { id: 'understand_self', text: '나 자신을 깊이 이해하는 사람' },
  { id: 'improve_daily', text: '매일 조금씩 더 나아지는 사람' },
  { id: 'organize_thoughts', text: '감정과 생각을 조화롭게 정리하는 사람' },
  { id: 'custom', text: '직접 입력', isCustom: true },
];

// 사용자 기본 정보 인터페이스
export interface UserInfo {
  username: string;
  initialReviewCount: number | undefined;
}

// 회고 습관 시간 정보 인터페이스
export interface WhenPreference {
  optionId: string;
  customValue?: string;
}

// 회고 습관 장소 정보 인터페이스
export interface WherePreference {
  optionId: string;
  customValue?: string;
}

// 회고 습관 목표 정보 인터페이스
export interface GoalPreference {
  optionId: string;
  customValue?: string;
}

// 온보딩 데이터 전체 인터페이스
export interface OnboardingData {
  userInfo: UserInfo;
  whenPreference: WhenPreference;
  wherePreference: WherePreference;
  goalPreference: GoalPreference;
}

// 각 온보딩 컴포넌트 공통 props 인터페이스
export interface OnboardStepComponentProps<T> {
  data: T;
  onDataChange: (data: T) => void;
  onNext: () => void;
  onPrev?: () => void;
}

// 시간대 설정을 위한 props
export interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
} 