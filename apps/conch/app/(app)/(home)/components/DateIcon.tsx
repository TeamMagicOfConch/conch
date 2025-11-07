import { View, Text, StyleSheet } from 'react-native'
import { SoraBg, EmptySora } from '@conch/assets/icons'
import { Colors } from '@conch/assets/colors'

interface DateIconProps {
  day: number
  type: 'FEELING' | 'THINKING' | 'EMPTY'
  size?: number
}

export default function DateIcon({ day, type, size = 36 }: DateIconProps) {
  const isFReview = type === 'FEELING'
  const fontSize = size * 0.33

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.iconContainer}>
        {type === 'EMPTY' ? (
          <EmptySora
            width={size}
            height={size}
          />
        ) : (
          <SoraBg
            color={isFReview ? Colors.fSora : Colors.tSora}
            width={size}
            height={size}
          />
        )}
      </View>
      <Text style={[styles.dayText, { fontSize }]}>
        {day}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: -4
  },
  dayText: {
    position: 'absolute',
    color: Colors.writtenGrey,
    textAlign: 'center',
  },
})


