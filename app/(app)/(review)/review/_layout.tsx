import { useReviewData } from './hooks'
import { ReviewLayoutBase } from '@/components'
import { Colors } from '@/assets/colors'
import { consts } from '@/utils'

export default function ReviewLayout() {
  const { review } = useReviewData()
  const { feedbackType } = review || {}
  const isFeeling = feedbackType === consts.reviewType.feeling
  const backgroundColor = isFeeling ? Colors.fSoraBg : Colors.tSoraBg

  return <ReviewLayoutBase backgroundColor={backgroundColor} />
}
