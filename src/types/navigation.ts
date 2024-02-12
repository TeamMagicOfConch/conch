import { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = {
  Calendar: {
    yearAndMonth: string
  }
  Review: {
    date: string
  }
  WriteReview: {
    date: string
  }
}

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>
