import { useState, useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { inquiryDate } from '@conch/utils'
import { InquiryDayRes } from '@api/conch/types/conchApi'

export type ReviewResponse = InquiryDayRes & { feedbackType?: string | string[] }

export function useReviewData() {
  const [review, setReview] = useState<ReviewResponse>({ body: '', feedback: '' })
  const { date, feedbackType } = useLocalSearchParams()

  useEffect(() => {
    // fetch review data with url and store it to review
    if (!date || !feedbackType) return
    const [year, month, day] = date
      .toString()
      .split('-')
      .map((str) => parseInt(str, 10))
    async function fetchAndSetReviewData() {
      const { body, feedback } = (await inquiryDate({ year, month: month + 1, day })) || {}

      setReview({
        body,
        feedback,
        feedbackType,
      })
    }
    fetchAndSetReviewData()
  }, [date, feedbackType])

  return { review }
}
