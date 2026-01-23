import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FallingSoraJar from '@conch/components/physics/FallingSoraJar'
import { Colors } from '@conch/assets/colors'

export default function DebugJarScreen() {
  const router = useRouter()
  const [count, setCount] = useState(1)
  const { width } = Dimensions.get('window')
  const jarWidth = Math.min(width * 0.8, 340)
  const jarHeight = jarWidth * 1.25

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
          <Text style={styles.sub}>count: {count}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <FallingSoraJar
          width={jarWidth}
          height={jarHeight}
          count={21}
          initialCount={20}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.secondary]}
          onPress={() => setCount((c) => Math.max(0, c - 1))}
        >
          <Text style={styles.btnText}>-1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => setCount((c) => c + 1)}
        >
          <Text style={styles.btnText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.secondary]}
          onPress={() => setCount((c) => c + 5)}
        >
          <Text style={styles.btnText}>+5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.secondary]}
          onPress={() => setCount(0)}
        >
          <Text style={styles.btnText}>reset</Text>
        </TouchableOpacity>
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
  sub: { marginTop: 6, color: Colors.lightGrey },
  buttons: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: 16 },
  btn: { backgroundColor: Colors.black, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  secondary: { backgroundColor: '#555' },
  btnText: { color: '#fff', fontWeight: '600' },
  footerBtn: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: Colors.black,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { color: '#fff', fontWeight: '700' },
})
