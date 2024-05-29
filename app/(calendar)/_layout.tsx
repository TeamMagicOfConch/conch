import { SafeAreaViewWithDefaultBackgroundColor } from '@/components'
import { Slot } from 'expo-router'

export default function CalendarLayout() {
  return (
    <SafeAreaViewWithDefaultBackgroundColor>
      <Slot />
    </SafeAreaViewWithDefaultBackgroundColor>
  )
}
