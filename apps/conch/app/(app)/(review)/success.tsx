import React, { useMemo } from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Colors } from '@conch/assets/colors'
import FallingSoraJar from '@conch/components/physics/FallingSoraJar'

export default function ReviewSuccessScreen() {
  const router = useRouter()
  const { count } = useLocalSearchParams<{ count?: string }>()
  const shells = useMemo(() => {
    const parsed = Number(count)
    if (Number.isFinite(parsed) && parsed > 0) return Math.min(parsed, 60)
    return 1
  }, [count])

  const { width } = Dimensions.get('window')
  const jarWidth = Math.min(width * 0.72, 320)
  const jarHeight = jarWidth * 1.25

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="닫기" onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{`${shells}일 작성 성공!`}</Text>
        <Text style={styles.subTitle}>시작이 반이다,
첫 회고를 작성했어요!</Text>
      </View>

      <View style={styles.jarWrap}>
        <FallingSoraJar
          width={jarWidth}
          height={jarHeight}
          count={shells}
          spawnIntervalMs={160}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cta}>
          <Text style={styles.ctaText}>내일도 작성하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgGrey,
  },
  header: {
    height: 56,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 28,
    color: Colors.textBlack,
  },
  titleWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textBlack,
  },
  subTitle: {
    marginTop: 8,
    textAlign: 'center',
    color: Colors.lightGrey,
  },
  jarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  cta: {
    height: 54,
    backgroundColor: Colors.textBlack,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})




