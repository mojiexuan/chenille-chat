<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, useAttrs, computed } from 'vue'
import type { CSSProperties } from 'vue'
import type { OrbState } from '../../components/Orb/Orb.types'

defineOptions({ inheritAttrs: false })

interface BarsThemeProps {
  state: OrbState
  volume: number
  size: number
  className?: string
  style?: CSSProperties
  disabled?: boolean
  interactive?: boolean
  onClick?: () => void
}

const props = withDefaults(defineProps<BarsThemeProps>(), {
  disabled: false,
  interactive: false,
})

const attrs = useAttrs()

const BAR_COUNT = 5

// Traveling wave: all bars share one frequency, evenly phase-shifted left→right.
const WAVE_FREQ = 1.4
const WAVE_PHASE_STEP = (Math.PI * 2) / BAR_COUNT

// Match Circle's per-state colors
const STATE_COLORS: Record<string, string> = {
  idle: '#cccccc',
  connecting: '#cccccc',
  listening: '#999999',
  speaking: '#e8e8e8',
  error: '#f87171',
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

// ─── Refs (mirror React useRef) ─────────────────────────────────────────────
const barRefs = ref<(HTMLSpanElement | null)[]>([])
const hoverRef = ref<HTMLSpanElement | null>(null)
const rafRef = { current: 0 }
const smoothed = { current: new Array(BAR_COUNT).fill(0) as number[] }
const volumeRef = { current: props.volume }
const hoveredRef = { current: false }
const hoverBoostRef = { current: 0 }
const currentColorRef = { current: hexToRgb(STATE_COLORS.idle!) as [number, number, number] }

// State transition: blend targets over BLEND_MS so bar heights don't jump
const BLEND_MS = 300
const blendStartRef = { current: null as number | null }
const frozenHeightsRef = { current: new Array(BAR_COUNT).fill(0) as number[] }
const prevStateRef = { current: props.state }

function setBarRef(el: unknown, i: number) {
  barRefs.value[i] = el as HTMLSpanElement | null
}

// ─── Geometry (recomputed reactively like React render body) ────────────────
const barW = computed(() => props.size * 0.055)
const gap = computed(() => props.size * 0.035)
const radius = computed(() => props.size * 0.03)
const maxH = computed(() => props.size * 0.55)
const minH = computed(() => props.size * 0.06)

const rootStyle = computed<CSSProperties>(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  ...props.style,
}))

// Track latest volume into ref (React: useEffect on [volume])
watch(
  () => props.volume,
  (v) => {
    volumeRef.current = v
  },
)

// State transition freeze (React: useEffect on [state])
watch(
  () => props.state,
  (state) => {
    if (state !== prevStateRef.current) {
      frozenHeightsRef.current = [...smoothed.current]
      blendStartRef.current = Date.now()
      prevStateRef.current = state
    }
  },
)

// ─── Animation loop (React: useEffect on [state, size]) ─────────────────────
function startAnimation() {
  cancelAnimationFrame(rafRef.current)

  const size = props.size
  const state = props.state
  const maxHl = size * 0.55
  const minHl = size * 0.06

  const color = STATE_COLORS[state] ?? STATE_COLORS.idle

  const hoverBoostMax = size * 0.1
  // Diamond shape: center bar gets full boost, outer bars get less
  // [0.3, 0.65, 1.0, 0.65, 0.3]
  const diamondWeights = Array.from({ length: BAR_COUNT }, (_, i) => {
    const center = (BAR_COUNT - 1) / 2
    return 1 - 0.7 * (Math.abs(i - center) / center)
  })

  const updateHoverBoost = () => {
    const canHover = true
    const target = hoveredRef.current && canHover ? hoverBoostMax : 0
    hoverBoostRef.current += (target - hoverBoostRef.current) * 0.15
  }

  const setBars = (heights: number[], col: string) => {
    updateHoverBoost()
    // Lerp color toward target
    const tRgb = hexToRgb(col)
    const [cr, cg, cb] = currentColorRef.current
    currentColorRef.current = [
      cr + (tRgb[0] - cr) * 0.08,
      cg + (tRgb[1] - cg) * 0.08,
      cb + (tRgb[2] - cb) * 0.08,
    ]
    const [r, g, b] = currentColorRef.current.map(Math.round)
    const lerpedColor = `rgb(${r},${g},${b})`

    for (let i = 0; i < BAR_COUNT; i++) {
      const el = barRefs.value[i]
      if (!el) continue
      // Diamond shape on idle, uniform boost on other states
      const weight = state === 'idle' ? diamondWeights[i]! : 1
      const boost = hoverBoostRef.current * weight
      el.style.height = `${Math.min(heights[i]! + boost, maxHl)}px`
      el.style.background = lerpedColor
      el.style.animation = 'none'
    }
  }

  if (state === 'listening' || state === 'speaking') {
    const freqScale = state === 'speaking' ? 1.0 : 0.4

    const animate = () => {
      const vol = volumeRef.current

      // Volume curves are now in the adapters — theme just animates
      const t = Date.now() / 1000

      for (let i = 0; i < BAR_COUNT; i++) {
        const osc =
          0.5 + 0.15 * Math.sin(t * WAVE_FREQ * freqScale * Math.PI * 2 + i * WAVE_PHASE_STEP)
        let targetH = minHl + (maxHl - minHl) * vol * osc

        // During state transition, blend the target from frozen heights
        if (blendStartRef.current !== null) {
          const elapsed = Date.now() - blendStartRef.current
          const progress = Math.min(elapsed / BLEND_MS, 1)
          const ease = 1 - (1 - progress) * (1 - progress)
          targetH = frozenHeightsRef.current[i]! + (targetH - frozenHeightsRef.current[i]!) * ease
          if (progress >= 1) blendStartRef.current = null
        }

        // Uniform lerp — speaking uses lower rate since bars show steps more visibly
        const rate = state === 'listening' ? 0.45 : 1.0

        smoothed.current[i]! += (targetH - smoothed.current[i]!) * rate
      }

      setBars(smoothed.current, color!)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return
  }

  // connecting — regular wave animation (loading feel)
  if (state === 'connecting') {
    const startTime = Date.now()
    const animate = () => {
      const t = (Date.now() - startTime) / 1000
      updateHoverBoost()
      for (let i = 0; i < BAR_COUNT; i++) {
        // Sine hump: 50% sweep, 50% rest — left to right
        const cycle = (t * 0.6 + (i / BAR_COUNT) * 0.5) % 1.0
        const wave = cycle < 0.5 ? Math.sin((cycle / 0.5) * Math.PI) : 0
        const targetH = minHl + (maxHl * 0.4 - minHl) * wave
        // Lerp from current height into wave for smooth transition from hover
        smoothed.current[i]! += (targetH - smoothed.current[i]!) * 0.15
      }
      setBars(smoothed.current, color!)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return
  }

  // idle / error — use rAF so hover boost is responsive
  cancelAnimationFrame(rafRef.current)
  const animateStatic = () => {
    updateHoverBoost()
    for (let i = 0; i < BAR_COUNT; i++) {
      smoothed.current[i]! += (minHl - smoothed.current[i]!) * 0.16
    }
    setBars(smoothed.current, color!)
    rafRef.current = requestAnimationFrame(animateStatic)
  }
  rafRef.current = requestAnimationFrame(animateStatic)
}

onMounted(() => {
  startAnimation()
})

// Re-run the effect whenever state or size changes (React deps: [state, size])
watch(
  () => [props.state, props.size],
  () => {
    startAnimation()
  },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(rafRef.current)
})

// ─── Hover handlers ─────────────────────────────────────────────────────────
function onMouseEnter() {
  if (props.disabled) return
  hoveredRef.current = true
  if (hoverRef.value) hoverRef.value.style.filter = 'brightness(1.35)'
}
function onMouseLeave() {
  hoveredRef.current = false
  if (hoverRef.value) hoverRef.value.style.filter = 'brightness(1)'
}
function onTouchEnd() {
  setTimeout(() => {
    hoveredRef.current = false
    if (hoverRef.value) hoverRef.value.style.filter = 'brightness(1)'
  }, 200)
}

const innerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: `${gap.value}px`,
  transition: 'filter 0.3s ease',
  cursor: props.interactive ? (props.disabled ? 'not-allowed' : 'pointer') : 'default',
}))

function barStyle(): CSSProperties {
  return {
    width: `${barW.value}px`,
    minHeight: `${minH.value}px`,
    maxHeight: `${maxH.value}px`,
    height: `${minH.value}px`,
    borderRadius: `${radius.value}px`,
    background: STATE_COLORS[props.state] ?? STATE_COLORS.idle,
  }
}

const buttonStyle = computed<CSSProperties>(() => ({
  appearance: 'none',
  WebkitAppearance: 'none',
  border: 0,
  padding: 0,
  margin: 0,
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  ...rootStyle.value,
}))
</script>

<template>
  <button v-if="interactive" v-bind="attrs" type="button" :class="className" :disabled="disabled" :style="buttonStyle"
    @click="disabled ? undefined : onClick?.()">
    <span ref="hoverRef" :style="innerStyle" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave"
      @touchend="onTouchEnd">
      <span v-for="i in BAR_COUNT" :key="i - 1" :ref="(el) => setBarRef(el, i - 1)" :style="barStyle()" />
    </span>
  </button>

  <div v-else v-bind="attrs" :class="className" :style="rootStyle">
    <span ref="hoverRef" :style="innerStyle" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave"
      @touchend="onTouchEnd">
      <span v-for="i in BAR_COUNT" :key="i - 1" :ref="(el) => setBarRef(el, i - 1)" :style="barStyle()" />
    </span>
  </div>
</template>
