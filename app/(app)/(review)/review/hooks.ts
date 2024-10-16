import { useState, useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { reviewGet } from '@/utils'
import type { FeedbackType, RawReview, Review } from '@/utils/api/review/types'

export function useReviewData() {
  const [review, setReview] = useState<Review>({ body: '', feedback: '' })
  const { date, feedbackType } = useLocalSearchParams()

  useEffect(() => {
    // fetch review data with url and store it to review
    if (!date || !feedbackType) return
    const [year, month, day] = date
      .toString()
      .split('-')
      .map((str) => parseInt(str, 10))
    async function fetchAndSetReviewData() {
      const {
        data: { data: reviewsData },
      } = await reviewGet('/day', { year, month: month + 1, day })

      const { body, feedback } = reviewsData as RawReview

      setReview({
        body,
        feedback,
        feedbackType: feedbackType as FeedbackType,
      })
    }
    fetchAndSetReviewData()
  }, [date, feedbackType])

  return { review }
}
