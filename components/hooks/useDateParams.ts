import { useRoute } from '@react-navigation/native'
import type { ReviewStackRouteProp } from '@/types/navigation'

export function useDateParams() {
  const { params } = useRoute<ReviewStackRouteProp>()
  const { date } = params

  return { date }
}
