import React, { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import type { Body as MatterBody } from 'matter-js'

const DEBUG_COLLISION_OPACITY = 0.5
const DEBUG_COLOR_STROKE = [
  `rgba(255, 0, 0, ${DEBUG_COLLISION_OPACITY})`,
  `rgba(0, 255, 0, ${DEBUG_COLLISION_OPACITY})`,
  `rgba(0, 0, 255, ${DEBUG_COLLISION_OPACITY})`,
  `rgba(255, 255, 0, ${DEBUG_COLLISION_OPACITY})`,
  `rgba(255, 0, 255, ${DEBUG_COLLISION_OPACITY})`,
  `rgba(0, 255, 255, ${DEBUG_COLLISION_OPACITY})`,
]

export interface BodyState {
  id: number
  x: number
  y: number
  angle: number
  radius: number
  parts?: Array<{ x: number; y: number; radius: number }> // 디버그용 파츠 정보
}

interface DebugBodyState {
  id: number
  parts?: Array<{ x: number; y: number; radius: number }>
}

interface DebugCollisionOverlayProps {
  width: number
  height: number
  bodies: DebugBodyState[]
}

function DebugCollisionOverlay({ width, height, bodies }: DebugCollisionOverlayProps) {
  console.log('DebugCollisionOverlay', bodies)
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {bodies.map((b) =>
          b.parts ? (
            <React.Fragment key={`debug-${b.id}`}>
              {b.parts.map((part, i) => (
                <Circle
                  key={`${b.id}-${i}`}
                  cx={part.x}
                  cy={part.y}
                  r={part.radius}
                  fill="none"
                  stroke={DEBUG_COLOR_STROKE[i]}
                  strokeWidth={1.5}
                />
              ))}
            </React.Fragment>
          ) : null
        )}
      </Svg>
    </View>
  )
}

export function useDebug(debug: boolean) {
  if (!debug) return {}

  return {
    DebugCollisionOverlay: memo(DebugCollisionOverlay),
    collectPartsInfo: (body: MatterBody, state: BodyState) => {
      state.parts = body.parts.slice(1).map((part) => ({
        x: part.position.x,
        y: part.position.y,
        radius: (part as any).circleRadius || 0,
      }))
    },
    addDebugInfoToParts: (parts: any[], radiusList: number[]) => {
      parts.forEach((part, i) => {
        ; (part as any).circleRadius = radiusList[i]
      })
    },
  }
}
