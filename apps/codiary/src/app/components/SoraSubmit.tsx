import { useState, useRef, useCallback, useEffect } from 'react'

interface SoraSubmitProps {
  onSubmit: () => void
  disabled?: boolean
  isSubmitted?: boolean
}

const BAR_MIN = 20
const THRESHOLD = 120
const MAX_PULL = 250

export function SoraSubmit({ onSubmit, disabled, isSubmitted }: SoraSubmitProps) {
  const [pull, setPull] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'pulling' | 'retracting'>('idle')
  const startX = useRef(0)
  const pullRef = useRef(0)
  const ringRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()

  const canInteract = !disabled && !isSubmitted && phase !== 'retracting'
  const progress = Math.min(1, pull / THRESHOLD)

  // Keep ref in sync for animation callbacks
  pullRef.current = pull

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const animateRetract = useCallback((from: number, duration: number, onComplete: () => void) => {
    const start = performance.now()

    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = t * t // ease-in (accelerating snap)
      setPull(Math.max(0, from * (1 - eased)))

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setPull(0)
        onComplete()
      }
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!canInteract) return
      e.preventDefault()
      ringRef.current?.setPointerCapture(e.pointerId)
      startX.current = e.clientX
      setPhase('pulling')
    },
    [canInteract],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== 'pulling') return
      const delta = Math.max(0, Math.min(MAX_PULL, e.clientX - startX.current))
      setPull(delta)

      // Haptic feedback when crossing threshold
      if (delta >= THRESHOLD && pullRef.current < THRESHOLD) {
        try {
          navigator?.vibrate?.(10)
        } catch {}
      }
    },
    [phase],
  )

  const handlePointerUp = useCallback(() => {
    if (phase !== 'pulling') return

    const {current} = pullRef

    if (current >= THRESHOLD) {
      setPhase('retracting')
      animateRetract(current, 300, () => {
        setPhase('idle')
        onSubmit()
      })
    } else {
      animateRetract(current, 150, () => {
        setPhase('idle')
      })
    }
  }, [phase, animateRetract, onSubmit])

  const ringBg = progress >= 1 ? '#f59e0b' : '#424040'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center select-none ${!canInteract ? 'opacity-40' : ''}`}>
        {/* Sora character */}
        <img
          src="/sora.svg"
          width={48}
          height={53}
          alt=""
          className="flex-shrink-0 pointer-events-none"
          draggable={false}
        />

        {/* Bar */}
        <div
          className="h-[5px] bg-[#424040]"
          style={{ width: BAR_MIN + pull, marginLeft: -2 }}
        />

        {/* Ring (drag handle) */}
        <div
          ref={ringRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 touch-none"
          style={{
            backgroundColor: ringBg,
            cursor: canInteract ? 'grab' : 'not-allowed',
            transition: phase === 'pulling' ? 'background-color 0.15s' : undefined,
          }}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-white pointer-events-none" />
        </div>
      </div>

      {/* Hint text */}
      <p className="text-xs text-gray-400 h-4">
        {isSubmitted
          ? '제출 완료'
          : phase === 'pulling' && progress >= 1
            ? '놓으면 제출됩니다'
            : disabled
              ? '일기를 작성해주세요'
              : '고리를 잡아당겨 제출하세요'}
      </p>
    </div>
  )
}
