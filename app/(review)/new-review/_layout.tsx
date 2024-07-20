import { ReviewLayoutBase } from '@/components'
import { ReviewContextProvider } from './context'

export default function ReviewLayout() {
  return (
    <ReviewContextProvider>
      <ReviewLayoutBase />
    </ReviewContextProvider>
  )
}
