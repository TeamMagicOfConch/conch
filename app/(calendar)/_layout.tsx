import { SafeAreaViewWithDefaultBackgroundColor } from '@/components'
import { Slot } from 'expo-router'
import { Colors } from '@/assets/colors'

export default function CalendarLayout() {
  return (
    <SafeAreaViewWithDefaultBackgroundColor>
      <Slot />
    </SafeAreaViewWithDefaultBackgroundColor>
  )
}
