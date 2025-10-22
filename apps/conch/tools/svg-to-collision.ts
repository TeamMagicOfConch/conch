import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'svgson'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { svgPathProperties } = require('svg-path-properties')
import simplify from 'simplify-js'

const projectRoot = path.resolve(__dirname, '..')
const SRC = path.join(projectRoot, 'assets/icons/sora/sora.svg')
const OUT = path.join(projectRoot, 'assets/icons/sora/collision.json')

const SAMPLE_STEP = 0.5 // 더 촘촘하게 샘플링
const TOLERANCE = 0.3 // 더 정확하게 단순화
const HIGH_QUALITY = true

async function main() {
  const svg = fs.readFileSync(SRC, 'utf8')
  const json = await parse(svg)
  const paths = (json.children || []).flatMap((c: any) => (c.name === 'path' ? [c] : []))
  if (!paths.length) throw new Error('No <path> found in ' + SRC)

  // pick the longest path as outline
  const largest = paths.sort((a: any, b: any) => (a.attributes.d?.length ?? 0) - (b.attributes.d?.length ?? 0)).pop()!
  const d: string = largest.attributes.d
  const props = new svgPathProperties(d)
  const len = props.getTotalLength()

  const pts: Array<{ x: number; y: number }> = []
  for (let s = 0; s < len; s += SAMPLE_STEP) {
    const { x, y } = props.getPointAtLength(s)
    pts.push({ x, y })
  }

  const simp = simplify(pts, TOLERANCE, HIGH_QUALITY)

  // normalize to [-0.5..0.5] box centered at origin
  const minX = Math.min(...simp.map((p) => p.x))
  const maxX = Math.max(...simp.map((p) => p.x))
  const minY = Math.min(...simp.map((p) => p.y))
  const maxY = Math.max(...simp.map((p) => p.y))
  const w = maxX - minX
  const h = maxY - minY
  const scale = 1 / Math.max(w, h)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  const norm = simp.map((p) => ({ x: (p.x - cx) * scale, y: (p.y - cy) * scale }))
  const outDir = path.dirname(OUT)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify({ points: norm }, null, 2))
  // eslint-disable-next-line no-console
  console.log('wrote', OUT, 'points:', norm.length)
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})


