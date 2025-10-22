import React, { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import Matter, { type IBodyDefinition } from 'matter-js'
import { Colors } from '@conch/assets/colors'
import { Sora } from '@conch/assets/icons/sora'
import type { FallingSoraJarProps } from './types'
import collisionShape from '@conch/assets/icons/sora/collision.json'
import { useDebug, type BodyState } from './hooks'

const STOP_AFTER_SEC = 3
const DEBUG_COLLISION = process.env.EXPO_PUBLIC_DEBUG_JAR === '1' // 디버그 모니터링 활성화 조건

export default function FallingSoraJar({ width, height, count, spawnIntervalMs = 120 }: FallingSoraJarProps) {
  const [bodies, setBodies] = useState<BodyState[]>([])
  const engineRef = useRef<Matter.Engine | null>(null)
  const worldRef = useRef<Matter.World | null>(null)
  const bodyMapRef = useRef<Map<number, Matter.Body>>(new Map())
  const idRef = useRef(0)
  const animRef = useRef<number>(0)
  const lastTsRef = useRef<number | null>(null)
  const spawnRef = useRef({ spawned: 0, lastSpawn: 0, target: count })
  const elapsedRef = useRef(0)
  const frozenRef = useRef(false)
  const runningRef = useRef(false)

  const { DebugCollisionOverlay, collectPartsInfo: collectPartsInfoForDebug, addDebugInfoToParts } = useDebug(false)

  const radii = useMemo(() => ({ min: Math.max(12, width * 0.05), max: Math.max(16, width * 0.08) }), [width])

  const jarGeom = useMemo(() => {
    const w = width
    const h = height
    const wall = Math.max(8, Math.round(w * 0.06))
    const neckWidth = Math.round(w * 0.62)
    const neckHeight = Math.round(h * 0.12)
    const bodyTop = neckHeight + Math.round(h * 0.02)
    const bodyBottom = h - Math.round(h * 0.06)
    const bodyLeft = Math.round((w - neckWidth) / 2)
    const bodyRight = w - bodyLeft
    return { w, h, wall, neckWidth, neckHeight, bodyTop, bodyBottom, bodyLeft, bodyRight }
  }, [width, height])

  useEffect(() => {
    // Matter.js 엔진 초기화
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.3 },
      positionIterations: 5, // 위치 제약 해소 반복
      velocityIterations: 3, // 속도 제약 해소 반복
      constraintIterations: 2, // 제약 반복
      enableSleeping: true, // 슬리핑 활성화 (정지한 바디 계산 스킵)
    })
    // 슬리핑 임계값 조정 (더 빨리 슬립)
    engine.timing.timeScale = 1
    if (engine.gravity) {
      engine.gravity.scale = 0.001
    }
    engineRef.current = engine
    worldRef.current = engine.world

    // 벽 생성 (병 내부 경계)
    const wallThickness = 20
    const walls = [
      // 좌벽 (병 내부 왼쪽 경계)
      Matter.Bodies.rectangle(
        jarGeom.bodyLeft - wallThickness / 2,
        (jarGeom.bodyTop + jarGeom.bodyBottom) / 2,
        wallThickness,
        jarGeom.bodyBottom - jarGeom.bodyTop,
        { isStatic: true, friction: 0.5, restitution: 0.3 }
      ),
      // 우벽 (병 내부 오른쪽 경계)
      Matter.Bodies.rectangle(
        jarGeom.bodyRight + wallThickness / 2,
        (jarGeom.bodyTop + jarGeom.bodyBottom) / 2,
        wallThickness,
        jarGeom.bodyBottom - jarGeom.bodyTop,
        { isStatic: true, friction: 0.5, restitution: 0.3 }
      ),
      // 바닥 (병 내부 하단)
      Matter.Bodies.rectangle(
        (jarGeom.bodyLeft + jarGeom.bodyRight) / 2,
        jarGeom.bodyBottom + wallThickness / 2,
        jarGeom.bodyRight - jarGeom.bodyLeft + wallThickness * 2,
        wallThickness,
        { isStatic: true, friction: 0.9, restitution: 0.2 }
      ),
    ]
    Matter.World.add(engine.world, walls)

    setBodies([])
    bodyMapRef.current.clear()
    spawnRef.current = { spawned: 0, lastSpawn: 0, target: count }
    lastTsRef.current = null
    elapsedRef.current = 0
    frozenRef.current = false
    runningRef.current = true
    cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animRef.current)
      Matter.Engine.clear(engine)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

  useEffect(() => {
    spawnRef.current.target = count
    if (spawnRef.current.spawned < spawnRef.current.target) {
      frozenRef.current = false
      elapsedRef.current = 0
      if (!runningRef.current) {
        lastTsRef.current = null
        cancelAnimationFrame(animRef.current)
        animRef.current = requestAnimationFrame(loop)
        runningRef.current = true
      }
    }
  }, [count])

  const loop = (ts: number) => {
    if (!engineRef.current || !worldRef.current) return
    if (lastTsRef.current == null) lastTsRef.current = ts
    const dt = Math.min(32, ts - lastTsRef.current)
    lastTsRef.current = ts
    elapsedRef.current += dt / 1000

    if (!frozenRef.current && elapsedRef.current >= STOP_AFTER_SEC) {
      frozenRef.current = true
      spawnRef.current.target = spawnRef.current.spawned
      // 모든 바디를 슬립 상태로
      bodyMapRef.current.forEach((body) => {
        Matter.Body.setStatic(body, true)
      })
      runningRef.current = false
      return
    }

    if (spawnRef.current.spawned < spawnRef.current.target) {
      if (ts - spawnRef.current.lastSpawn > spawnIntervalMs) {
        spawnRef.current.lastSpawn = ts
        spawnOne()
      }
    }

    Matter.Engine.update(engineRef.current)

    const updated: BodyState[] = []
    bodyMapRef.current.forEach((body, id) => {
      const state: BodyState = {
        id,
        x: body.position.x,
        y: body.position.y,
        angle: body.angle,
        radius: (body as any).circleRadius || radii.min,
      }
      // 디버그 모드: 파츠 정보 수집
      collectPartsInfoForDebug?.(body, state)

      updated.push(state)
    })
    setBodies(updated)

    animRef.current = requestAnimationFrame(loop)
    runningRef.current = true
  }

  const spawnOne = () => {
    if (!worldRef.current) return
    const id = idRef.current++
    const r = rand(radii.min, radii.max)
    // const r = 60
    const x = jarGeom.w / 2 + rand(-jarGeom.neckWidth * 0.25, jarGeom.neckWidth * 0.25)
    const y = -r - 6

    // 소라 모양 근사: 여러 원 조합 (머리, 몸통, 꼬리, 입)
    // 반지름 10% 확대해서 보수적으로
    const k = 1.28
    const radiusList = [
      r * 0.65 * k, 
      r * 0.3 * k, 
      r * 0.48 * k,
      r * 0.2 * k,
    ]
      const physics: IBodyDefinition = {
        restitution: 0.05, // 거의 안 튕김 (0.15 → 0.05)
        friction: 1.5,
        frictionStatic: 1.0, // 정지 마찰 추가 (쌓인 소라 안 밀림)
        frictionAir: 0.025,
        density: 0.001,
        slop: 0.08,
        sleepThreshold: 10, // 빠른 슬립 (30 → 15)
      }
    const parts = [
      // red
      Matter.Bodies.circle(x - r * 0.7, y + r * 0.2, radiusList[0], physics),
      // green
      Matter.Bodies.circle(x - r * 0.2, y + r * 0.55, radiusList[1], physics),
      // blue
      Matter.Bodies.circle(x - r, y - r * 0.2, radiusList[2], physics),
      // yellow
      Matter.Bodies.circle(x - r * 1.4, y - r * 0.65, radiusList[3], physics),
    ]

    // 여러 원을 하나의 컴포지트 바디로 합성
    const body = Matter.Body.create({
      parts,
      ...physics,
    })
    Matter.Body.setPosition(body, { x, y })
    ;(body as any).circleRadius = r
    // 디버그용: 각 파츠에 반지름 정보 저장
    addDebugInfoToParts?.(body.parts.slice(1), radiusList)
    Matter.World.add(worldRef.current, body)
    bodyMapRef.current.set(id, body)
    spawnRef.current.spawned += 1
  }

  return (
    <View style={{ width, height }}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {bodies.map((b) => (
          <Shell key={b.id} x={b.x} y={b.y} r={b.radius} rotation={b.angle} />
        ))}
      </View>

      {/* 디버그: 충돌 원 윤곽선 */}
      {DebugCollisionOverlay && <DebugCollisionOverlay width={width} height={height} bodies={bodies} />}

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <JarOverlay width={width} height={height} geom={jarGeom} />
      </View>
    </View>
  )
}

const Shell = React.memo(({ x, y, r, rotation }: { x: number; y: number; r: number; rotation: number }) => {
  return (
    <View style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: [{ rotate: `${rotation}rad` }] }}>
      <Sora width={r * 2} height={r * 2} color={Colors.tSora} />
    </View>
  )
})

function JarOverlay({ width, height, geom }: { width: number; height: number; geom: any }) {
  const stroke = '#2D2D2D'
  const sw = Math.max(2, Math.round(width * 0.012))

  const body = buildBodyPath(geom)
  const outer = `M 0 0 H ${width} V ${height} H 0 Z`
  const evenOdd = `${outer} ${body}`
  const lipW = Math.min(width * 0.74, geom.neckWidth + 32)
  const lipH = Math.max(12, Math.round(height * 0.06))
  const lipX = (width - lipW) / 2
  const lipY = geom.bodyTop - lipH - 4

  return (
    <Svg width={width} height={height}>
      <Path d={evenOdd} fill={Colors.bgGrey} fillRule="evenodd" />
      <Path d={body} fill="none" stroke={stroke} strokeWidth={sw} />
      <Path d={roundedRectPath(lipX, lipY, lipW, lipH, lipH / 2)} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
      <Path d={roundedRectPath(lipX - 14, lipY + lipH * 0.4, 18, lipH * 0.5, 6)} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
      <Path d={roundedRectPath(lipX + lipW - 4, lipY + lipH * 0.4, 18, lipH * 0.5, 6)} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
    </Svg>
  )
}

function buildBodyPath(geom: any) {
  const x = geom.bodyLeft
  const y = geom.bodyTop
  const w = geom.bodyRight - geom.bodyLeft
  const h = geom.bodyBottom - geom.bodyTop
  const r = Math.min(28, Math.round(w * 0.1))
  return roundedRectPath(x, y, w, h, r)
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    'Z',
  ].join(' ')
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const styles = StyleSheet.create({
  jarBg: {
    ...StyleSheet.absoluteFillObject,
  },
})
