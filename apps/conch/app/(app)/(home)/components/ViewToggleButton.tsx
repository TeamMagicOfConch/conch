import { StyleSheet, Pressable } from 'react-native'
import { ListIcon, CalendarIcon } from '@conch/assets/icons'
import { Colors } from '@conch/assets/colors'

type ViewMode = 'calendar' | 'list'

interface ViewToggleButtonProps {
  viewMode: ViewMode
  onToggle: () => void
}

export default function ViewToggleButton({ viewMode, onToggle }: ViewToggleButtonProps) {
  const Icon = viewMode === 'calendar' ? ListIcon : CalendarIcon

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onToggle}
    >
      <Icon
        width={24}
        height={24}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 104,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 28,
    backgroundColor: Colors.onboardingPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
})

