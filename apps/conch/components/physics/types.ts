export interface FallingSoraJarProps {
  width: number
  height: number
  count: number
  initialCount?: number
  spawnIntervalMs?: number
  onReady?: () => void
}
