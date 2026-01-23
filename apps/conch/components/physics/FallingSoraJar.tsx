import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import Matter, { type IBodyDefinition } from 'matter-js'
import { Colors } from '@conch/assets/colors'
import { Sora } from '@conch/assets/icons/sora'
import jarImage from '@conch/assets/images/jar.png'
import type { FallingSoraJarProps } from './types'
import { useDebug, type BodyState } from './hooks'

export default function FallingSoraJar({ width, height, count, initialCount = 0, spawnIntervalMs = 250, onReady }: FallingSoraJarProps) {
  const [bodies, setBodies] = useState<BodyState[]>([])
  const engineRef = useRef<Matter.Engine | null>(null)
  const worldRef = useRef<Matter.World | null>(null)
  const bodyMapRef = useRef<Map<number, Matter.Body>>(new Map())
  const idRef = useRef(0)
  const animRef = useRef<number>(0)
  const lastTsRef = useRef<number | null>(null)
  const spawnRef = useRef({ spawned: 0, lastSpawn: 0, target: count })
  const frozenRef = useRef(false)
  const runningRef = useRef(false)

  const { DebugCollisionOverlay, getPartsInfo: getPartsInfoForDebug, addDebugInfoToParts } = useDebug(false)

  const radii = useMemo(() => {
    const min = Math.max(12, width * 0.045)
    const max = Math.max(16, width * 0.072)
    const fixed = (min + max) / 2
    return { min, max, fixed }
  }, [width])

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
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.7 },
      positionIterations: 5,
      velocityIterations: 3,
      constraintIterations: 2,
      enableSleeping: true,
    })
    engine.timing.timeScale = 1
    if (engine.gravity) {
      engine.gravity.scale = 0.001
    }
    engineRef.current = engine
    worldRef.current = engine.world

    const wallThickness = 20
    const wallPadding = radii.max * 0.4
    const walls = [
      Matter.Bodies.rectangle(
        jarGeom.bodyLeft + wallPadding - wallThickness / 2,
        (jarGeom.bodyTop + jarGeom.bodyBottom) / 2,
        wallThickness,
        jarGeom.bodyBottom - jarGeom.bodyTop,
        { isStatic: true, friction: 0.5, restitution: 0.3 },
      ),
      Matter.Bodies.rectangle(
        jarGeom.bodyRight - wallPadding + wallThickness / 2,
        (jarGeom.bodyTop + jarGeom.bodyBottom) / 2,
        wallThickness,
        jarGeom.bodyBottom - jarGeom.bodyTop,
        { isStatic: true, friction: 0.5, restitution: 0.3 },
      ),
      Matter.Bodies.rectangle(
        (jarGeom.bodyLeft + jarGeom.bodyRight) / 2,
        jarGeom.bodyBottom - wallPadding + wallThickness / 2,
        jarGeom.bodyRight - jarGeom.bodyLeft - wallPadding * 2 + wallThickness * 2,
        wallThickness,
        { isStatic: true, friction: 0.9, restitution: 0.2 },
      ),
    ]
    Matter.World.add(engine.world, walls)

    setBodies([])
    bodyMapRef.current.clear()
    idRef.current = 0

    const spawnOneInternal = (x: number, y: number): Matter.Body => {
      const id = idRef.current + 1
      idRef.current += 1
      const r = radii.fixed
      const k = 1.28
      const radiusList = [r * 0.65 * k, r * 0.3 * k, r * 0.48 * k, r * 0.2 * k]
      const physics: IBodyDefinition = {
        restitution: 0.05,
        friction: 1.5,
        frictionStatic: 1.0,
        frictionAir: 0.025,
        density: 0.001,
        slop: 0.08,
        sleepThreshold: 10,
      }
      const parts = [
        Matter.Bodies.circle(x - r * 0.7, y + r * 0.2, radiusList[0], physics),
        Matter.Bodies.circle(x - r * 0.2, y + r * 0.55, radiusList[1], physics),
        Matter.Bodies.circle(x - r, y - r * 0.2, radiusList[2], physics),
        Matter.Bodies.circle(x - r * 1.4, y - r * 0.65, radiusList[3], physics),
      ]
      const body = Matter.Body.create({ parts, ...physics })
      Matter.Body.setPosition(body, { x, y })
      ;(body as any).circleRadius = r
      Matter.World.add(engine.world, body)
      bodyMapRef.current.set(id, body)
      return body
    }

    if (initialCount > 0) {
      const spawnAreaLeft = jarGeom.bodyLeft + radii.fixed + wallPadding
      const spawnAreaRight = jarGeom.bodyRight - radii.fixed - wallPadding
      const spawnAreaTop = jarGeom.bodyTop + radii.fixed * 2
      const spawnAreaBottom = jarGeom.bodyBottom - radii.fixed - wallPadding
      const spawnAreaWidth = spawnAreaRight - spawnAreaLeft
      const spawnAreaHeight = spawnAreaBottom - spawnAreaTop

      const cols = Math.max(1, Math.ceil(Math.sqrt(initialCount * (spawnAreaWidth / spawnAreaHeight))))
      const rows = Math.max(1, Math.ceil(initialCount / cols))
      const cellWidth = spawnAreaWidth / cols
      const cellHeight = spawnAreaHeight / rows
      const jitter = radii.fixed * 0.3

      for (let i = 0; i < initialCount; i += 1) {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = spawnAreaLeft + (col + 0.5) * cellWidth + rand(-jitter, jitter)
        const y = spawnAreaTop + (row + 0.5) * cellHeight + rand(-jitter, jitter)
        spawnOneInternal(x, y)
      }

      // Pre-run physics simulation to settle bodies before first render
      const SETTLE_ITERATIONS = 400
      for (let i = 0; i < SETTLE_ITERATIONS; i += 1) {
        Matter.Engine.update(engine, 16.67)
      }

      bodyMapRef.current.forEach((body) => {
        Matter.Body.setStatic(body, true)
      })

      const initialStates: BodyState[] = []
      bodyMapRef.current.forEach((body, id) => {
        initialStates.push({
          id,
          x: body.position.x,
          y: body.position.y,
          angle: body.angle,
          radius: (body as any).circleRadius || radii.fixed,
        })
      })
      setBodies(initialStates)
      onReady?.()
    }

    spawnRef.current = { spawned: initialCount, lastSpawn: 0, target: count }
    lastTsRef.current = null

    if (count > initialCount) {
      frozenRef.current = false
      runningRef.current = true
      cancelAnimationFrame(animRef.current)
      animRef.current = requestAnimationFrame(loop)
    } else {
      frozenRef.current = true
      runningRef.current = false
    }

    return () => {
      cancelAnimationFrame(animRef.current)
      Matter.Engine.clear(engine)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, initialCount])

  const spawnOneAt = useCallback(
    (x: number, y: number): Matter.Body | null => {
      if (!worldRef.current) return null
      const id = idRef.current + 1
      idRef.current += 1
      const r = radii.fixed

      // 소라 모양 근사: 여러 원 조합 (머리, 몸통, 꼬리, 입)
      // 반지름 10% 확대해서 보수적으로
      const k = 1.28
      const radiusList = [r * 0.65 * k, r * 0.3 * k, r * 0.48 * k, r * 0.2 * k]
      const physics: IBodyDefinition = {
        restitution: 0.05,
        friction: 1.5,
        frictionStatic: 1.0,
        frictionAir: 0.025,
        density: 0.001,
        slop: 0.08,
        sleepThreshold: 10,
      }
      const parts = [
        Matter.Bodies.circle(x - r * 0.7, y + r * 0.2, radiusList[0], physics),
        Matter.Bodies.circle(x - r * 0.2, y + r * 0.55, radiusList[1], physics),
        Matter.Bodies.circle(x - r, y - r * 0.2, radiusList[2], physics),
        Matter.Bodies.circle(x - r * 1.4, y - r * 0.65, radiusList[3], physics),
      ]

      const body = Matter.Body.create({
        parts,
        ...physics,
      })
      Matter.Body.setPosition(body, { x, y })
      ;(body as any).circleRadius = r
      addDebugInfoToParts?.(body.parts.slice(1), radiusList)
      Matter.World.add(worldRef.current, body)
      bodyMapRef.current.set(id, body)
      spawnRef.current.spawned += 1
      return body
    },
    [addDebugInfoToParts, radii.fixed],
  )

  const spawnOne = useCallback(() => {
    const x = jarGeom.w / 2 + rand(-jarGeom.neckWidth * 0.125, jarGeom.neckWidth * 0.125)
    const y = radii.fixed + 100
    return spawnOneAt(x, y)
  }, [spawnOneAt, jarGeom.neckWidth, jarGeom.w, radii.fixed])

  const loop = useCallback(
    (ts: number) => {
      if (!engineRef.current || !worldRef.current) return
      if (lastTsRef.current === null) lastTsRef.current = ts
      const dt = Math.min(32, ts - lastTsRef.current)
      lastTsRef.current = ts

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
          radius: (body as any).circleRadius || radii.fixed,
        }
        // 디버그 모드: 파츠 정보 수집
        if (getPartsInfoForDebug) {
          state.parts = getPartsInfoForDebug(body)
        }

        updated.push(state)
      })
      setBodies(updated)

      animRef.current = requestAnimationFrame(loop)
      runningRef.current = true
    },
    [getPartsInfoForDebug, radii.fixed, spawnIntervalMs, spawnOne],
  )

  useEffect(() => {
    spawnRef.current.target = count
    if (spawnRef.current.spawned < spawnRef.current.target) {
      frozenRef.current = false
      if (!runningRef.current) {
        lastTsRef.current = null
        cancelAnimationFrame(animRef.current)
        animRef.current = requestAnimationFrame(loop)
        runningRef.current = true
      }
    }
  }, [count, loop])

  return (
    <View style={{ width, height }}>
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <JarOverlay
          width={width}
          height={height}
          geom={jarGeom}
        />
      </View>

      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {bodies.map((b) => (
          <Shell
            key={b.id}
            x={b.x}
            y={b.y}
            r={b.radius}
            rotation={b.angle}
            opacity={0.7}
          />
        ))}
      </View>

      {DebugCollisionOverlay && (
        <DebugCollisionOverlay
          width={width}
          height={height}
          bodies={bodies}
        />
      )}
    </View>
  )
}

const Shell = React.memo(({ x, y, r, rotation, opacity = 1 }: { x: number; y: number; r: number; rotation: number; opacity?: number }) => (
  <View style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: [{ rotate: `${rotation}rad` }], opacity }}>
    <Sora
      width={r * 2}
      height={r * 2}
      color={Colors.tSora}
    />
  </View>
))

function JarOverlay({ width, height, geom }: { width: number; height: number; geom: any }) {
  const body = buildBodyPath(geom)
  const outer = `M 0 0 H ${width} V ${height} H 0 Z`
  const evenOdd = `${outer} ${body}`

  const jarWidth = geom.bodyRight - geom.bodyLeft
  const jarHeight = geom.bodyBottom
  const jarLeft = geom.bodyLeft
  const jarTop = height * 0.075 // 위에서 5% 아래로 이동

  return (
    <View style={{ width, height }}>
      {/* 병 바깥 배경 채우기 (회색) */}
      <Svg
        width={width}
        height={height}
      >
        <Path
          d={evenOdd}
          fill={Colors.bgGrey}
          fillRule="evenodd"
        />
        {/* 물리적 병 경계 stroke (디버그용) */}
        {/* <Path
          d={body}
          fill="none"
          stroke="red"
          strokeWidth={2}
        /> */}
      </Svg>

      {/* 그 위에 병 이미지 오버레이 */}
      <Image
        source={jarImage}
        style={{
          position: 'absolute',
          left: jarLeft,
          top: jarTop,
          width: jarWidth,
          height: jarHeight,
        }}
        resizeMode="contain"
      />
    </View>
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
