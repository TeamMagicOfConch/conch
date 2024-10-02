import { SafeAreaViewWithDefaultBackgroundColor } from '@/components'
import { Slot } from 'expo-router'

export default function CalendarLayout() {
  console.log('calendar layout')
  return (
    <SafeAreaViewWithDefaultBackgroundColor>
      <Slot />
    </SafeAreaViewWithDefaultBackgroundColor>
  )
}
