import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'

/** yyyy-mm-dd */
export type ReviewDateParam = `${string}-${string}-${string}`

export type RootStackParamList = {
  Calendar: {
    yearAndMonth: string
  }
  Review: {
    date: ReviewDateParam
  }
  WriteReview: {
    date: ReviewDateParam
  }
}

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>
export type RootStackRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>
export type ReviewStackRouteProp = RouteProp<RootStackParamList, 'Review'>
export type WriteReviewStackRouteProp = RouteProp<RootStackParamList, 'WriteReview'>
