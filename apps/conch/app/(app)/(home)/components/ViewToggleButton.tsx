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
      <Icon width={24} height={24} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.writtenGrey,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pressed: {
    opacity: 0.8,
  },
})

