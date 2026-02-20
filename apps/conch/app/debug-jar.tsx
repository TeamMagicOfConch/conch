import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FallingSoraJar from '@conch/components/physics/FallingSoraJar'
import { Colors } from '@conch/assets/colors'

export default function DebugJarScreen() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const { width } = Dimensions.get('window')
  const jarWidth = Math.min(width * 0.8, 340)
  const jarHeight = jarWidth * 1.25
  const jarCount = 21
  const jarInitialCount = 20

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/(app)/(home)')}
        >
          <Text style={styles.backBtnText}>← 홈</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={styles.title}>FallingSoraJar Debug</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => setRefreshKey((value) => value + 1)}
        >
          <Text style={styles.refreshBtnText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <FallingSoraJar
          key={`jar-${refreshKey}`}
          width={jarWidth}
          height={jarHeight}
          count={jarCount}
          initialCount={jarInitialCount}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgGrey },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 24, paddingHorizontal: 16 },
  backBtn: { width: 60, paddingVertical: 8 },
  backBtnText: { fontSize: 16, color: Colors.black, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
  refreshBtn: { minWidth: 72, paddingVertical: 8, alignItems: 'flex-end' },
  refreshBtnText: { fontSize: 16, color: Colors.black, fontWeight: '600' },
})
