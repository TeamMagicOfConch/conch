import { useState, useContext, createContext, type Dispatch, type SetStateAction, type ReactNode } from 'react'
import type { Review } from '@conch/utils/api/review/types'

interface ReviewContextType {
  review: Review
  setReview: Dispatch<SetStateAction<Review>>
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined)

export function ReviewContextProvider({ children }: { children: ReactNode }) {
  const [review, setReview] = useState<Review>({ body: '', feedback: '' })

  return <ReviewContext.Provider value={{ review, setReview }}>{children}</ReviewContext.Provider>
}

export function useReviewContext() {
  const context = useContext(ReviewContext)
  if (!context) return null
  return context
}
