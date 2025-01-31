import { ReviewLayoutBase } from '@conch/components'
import { Colors } from '@conch/assets/colors'
import { consts } from '@conch/utils'
import { useReviewData } from './hooks'

export default function ReviewLayout() {
  const { review } = useReviewData()
  const { feedbackType } = review || {}
  const isFeeling = feedbackType === consts.reviewType.feeling
  const backgroundColor = isFeeling ? Colors.fSoraBg : Colors.tSoraBg

  return <ReviewLayoutBase backgroundColor={backgroundColor} />
}
