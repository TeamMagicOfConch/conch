import { useState, useContext, createContext, type Dispatch, type SetStateAction, type ReactNode, useMemo } from 'react'
import type { SubmitReviewSSEOptions } from '@api/conch'

export type Review = SubmitReviewSSEOptions['review']

interface ReviewContextType {
  review: Review
  setReview: Dispatch<SetStateAction<Review>>
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined)

export function ReviewContextProvider({ children }: { children: ReactNode }) {
  const [review, setReview] = useState<Review>({ body: '', type: 'FEELING' })
  const value = useMemo(() => ({ review, setReview }), [review])

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
}

export function useReviewContext() {
  const context = useContext(ReviewContext)
  if (!context) return null
  return context
}
