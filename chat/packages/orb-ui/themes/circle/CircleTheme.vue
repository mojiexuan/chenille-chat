<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, useAttrs, computed } from 'vue'
import type { CSSProperties } from 'vue'
import type { OrbState } from '../../components/Orb/Orb.types'

defineOptions({ inheritAttrs: false })

interface CircleThemeProps {
  state: OrbState
  volume: number
  size: number
  className?: string
  style?: CSSProperties
  disabled?: boolean
  interactive?: boolean
  onClick?: () => void
}

const props = withDefaults(defineProps<CircleThemeProps>(), {
  disabled: false,
  interactive: false,
})

const attrs = useAttrs()

// ─── Color helpers ────────────────────────────────────────────────────────────

type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

const STATE_COLORS: Record<OrbState, string> = {
  idle: '#cccccc',
  connecting: '#cccccc',
  listening: '#999999',
  speaking: '#e8e8e8',
  error: '#f87171',
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes orb-circle-idle-pulse {
  from { transform: scale(1); }
  to   { transform: scale(1.06); }
}
@keyframes orb-circle-connecting-pulse {
  0%   { opacity: 1; transform: scale(1); }
  50%  { opacity: 0.6; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
`

// ─── Visual constants ─────────────────────────────────────────────────────────
// Volume arrives pre-normalized from the adapter (noise gate + EMA already
// applied). These constants only control the visual mapping vol → scale/glow.

// Scale: subtle breathing feel. At vol=0 → SPEAK_BASE; at vol=1 → SPEAK_BASE + SPEAK_RANGE.
const SPEAK_BASE = 0.95
const SPEAK_RANGE = 0.08 // 0.95 → 1.03 — subtle size change
const LISTEN_BASE = 0.82
const LISTEN_RANGE = 0.18 // 0.82 → 1.00 (expands toward voice, stays under speaking)

const SPEAK_GLOW = 24 // px at vol=1 (sigmoid caps effective max ~14px)
const LISTEN_GLOW = 0 // no glow during listening — clean edge

// Output lerp rate — interpolates the adapter's ~10 Hz signal up to 60 fps
// so the circle animates smoothly rather than snapping every 100 ms.
const LERP = 0.55
const SETTLE_RATE = 0.12
const SETTLE_SCALE_EPSILON = 0.002

// ─── Refs (mirror React useRef) ─────────────────────────────────────────────
const circleRef = ref<HTMLSpanElement | null>(null)
const glowRef = ref<HTMLSpanElement | null>(null)
const hoverRef = ref<HTMLSpanElement | null>(null)
const rafRef = { current: 0 }

// Sync adapter volume into a ref so the rAF loop always reads the latest
// value without being in the useEffect dependency array.
const volumeRef = { current: props.volume }
watch(
  () => props.volume,
  (v) => {
    volumeRef.current = v
  },
)

// Persistent animation state — survives speaking↔listening state transitions
// (the adapter debounces these, but refs make the theme resilient regardless).
const currentScaleRef = { current: 1 }
const currentGlowRef = { current: 0 }
const currentColorRef = { current: hexToRgb(STATE_COLORS.idle) as RGB }

// State transition blending — lerps base/range toward new state's targets
// so size changes smoothly between states without affecting volume reactivity
const TRANSITION_RATE = 0.06 // ~400ms to settle
const currentBaseRef = { current: LISTEN_BASE }
const currentRangeRef = { current: LISTEN_RANGE }

// Inject keyframes once
onMounted(() => {
  const id = 'orb-circle-keyframes'
  if (!document.getElementById(id)) {
    const el = document.createElement('style')
    el.id = id
    el.textContent = KEYFRAMES
    document.head.appendChild(el)
  }
})

// ─── rAF loop (listening + speaking) ─────────────────────────────────────
// Runs at display rate (~60 fps). Reads adapter volume via ref, interpolates
// toward target scale/glow/color, writes directly to DOM style.
function runEffect() {
  const el = circleRef.value
  if (!el) return

  const state = props.state

  if (state === 'listening' || state === 'speaking') {
    const base = state === 'speaking' ? SPEAK_BASE : LISTEN_BASE
    const range = state === 'speaking' ? SPEAK_RANGE : LISTEN_RANGE
    const glow = state === 'speaking' ? SPEAK_GLOW : LISTEN_GLOW

    const animate = () => {
      const vol = volumeRef.current

      // Blend base/range toward current state's targets (smooth state transitions)
      currentBaseRef.current += (base - currentBaseRef.current) * TRANSITION_RATE
      currentRangeRef.current += (range - currentRangeRef.current) * TRANSITION_RATE

      // Volume curves are now applied in the adapters — theme just animates
      const tScale = currentBaseRef.current + vol * currentRangeRef.current
      const tGlow = vol * glow

      // Lerp for listening only — speaking lerp handled by adapters
      if (state === 'listening') {
        currentScaleRef.current += (tScale - currentScaleRef.current) * LERP
        currentGlowRef.current += (tGlow - currentGlowRef.current) * LERP
      } else {
        currentScaleRef.current = tScale
        currentGlowRef.current = tGlow
      }

      // Color: lerp toward state color (handles state transition fades;
      // avoids CSS transition flicker on rapid speaking↔listening changes)
      const tRgb = hexToRgb(STATE_COLORS[state])
      const [cr, cg, cb] = currentColorRef.current
      currentColorRef.current = [
        cr + (tRgb[0] - cr) * 0.05,
        cg + (tRgb[1] - cg) * 0.05,
        cb + (tRgb[2] - cb) * 0.05,
      ]
      const [r, g, b] = currentColorRef.current.map(Math.round)

      el.style.transform = `scale(${currentScaleRef.current})`
      el.style.background = `rgb(${r},${g},${b})`
      el.style.boxShadow = 'none'
      el.style.animation = 'none'

      // Glow on separate element behind the circle — scales with circle
      const ge = glowRef.value
      if (ge) {
        const g2 = currentGlowRef.current
        ge.style.transform = `scale(${currentScaleRef.current})`
        ge.style.boxShadow = g2 > 0.5 ? `0 0 ${g2}px ${g2 * 0.4}px rgb(${r},${g},${b})` : 'none'
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
  } else {
    // Non-active states: settle from the current active visual before handing
    // off to CSS animations. This avoids a visible snap from listening's
    // compact base scale back to idle.
    cancelAnimationFrame(rafRef.current)
    const c = STATE_COLORS[state] ?? STATE_COLORS.idle
    const tRgb = hexToRgb(c)

    const settle = () => {
      currentScaleRef.current += (1 - currentScaleRef.current) * SETTLE_RATE
      currentGlowRef.current += (0 - currentGlowRef.current) * SETTLE_RATE

      const [cr, cg, cb] = currentColorRef.current
      currentColorRef.current = [
        cr + (tRgb[0] - cr) * SETTLE_RATE,
        cg + (tRgb[1] - cg) * SETTLE_RATE,
        cb + (tRgb[2] - cb) * SETTLE_RATE,
      ]
      const [r, g, b] = currentColorRef.current.map(Math.round)

      el.style.transform = `scale(${currentScaleRef.current})`
      el.style.background = `rgb(${r},${g},${b})`
      el.style.boxShadow = 'none'
      el.style.animation = 'none'

      if (glowRef.value) {
        glowRef.value.style.transform = `scale(${currentScaleRef.current})`
        glowRef.value.style.boxShadow = 'none'
      }

      const scaleDone = Math.abs(currentScaleRef.current - 1) < SETTLE_SCALE_EPSILON
      const glowDone = currentGlowRef.current < 0.1
      const colorDone = currentColorRef.current.every(
        (channel, i) => Math.abs(channel - tRgb[i]!) < 1,
      )

      if (scaleDone && glowDone && colorDone) {
        currentScaleRef.current = 1
        currentGlowRef.current = 0
        currentColorRef.current = tRgb

        el.style.transform = ''
        el.style.boxShadow = 'none'
        el.style.background = c
        if (glowRef.value) {
          glowRef.value.style.transform = 'scale(1)'
          glowRef.value.style.boxShadow = 'none'
        }

        if (state === 'idle') {
          el.style.animation = 'orb-circle-idle-pulse 3s ease-in-out infinite alternate'
        } else if (state === 'connecting') {
          el.style.animation = 'orb-circle-connecting-pulse 1.5s ease-in-out infinite'
        } else {
          el.style.animation = 'none'
        }
        return
      }

      rafRef.current = requestAnimationFrame(settle)
    }

    rafRef.current = requestAnimationFrame(settle)
  }
}

onMounted(() => {
  runEffect()
})

// React deps: [state]
watch(
  () => props.state,
  () => {
    cancelAnimationFrame(rafRef.current)
    runEffect()
  },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(rafRef.current)
})

// ─── Geometry / styles (mirror React render body) ───────────────────────────
const d = computed(() => props.size * 0.55)

const rootStyle = computed<CSSProperties>(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  ...props.style,
}))

const innerStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  display: 'inline-block',
  transition: 'transform 0.3s ease, filter 0.3s ease',
  cursor: props.interactive ? (props.disabled ? 'not-allowed' : 'pointer') : 'default',
  borderRadius: '50%',
  lineHeight: 0,
}))

const glowStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  display: 'block',
  width: `${d.value}px`,
  height: `${d.value}px`,
  borderRadius: '50%',
  pointerEvents: 'none',
}))

const circleStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  display: 'block',
  width: `${d.value}px`,
  height: `${d.value}px`,
  borderRadius: '50%',
  background: STATE_COLORS[props.state],
}))

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

// ─── Hover handlers ─────────────────────────────────────────────────────────
function onMouseEnter() {
  if (hoverRef.value && !props.disabled) {
    hoverRef.value.style.transform = 'scale(1.06)'
    hoverRef.value.style.filter = 'brightness(1.12)'
  }
}
function onMouseLeave() {
  if (hoverRef.value) {
    hoverRef.value.style.transform = 'scale(1)'
    hoverRef.value.style.filter = 'brightness(1)'
  }
}
function onTouchEnd() {
  // Reset hover on mobile — touchend fires but mouseleave doesn't
  setTimeout(() => {
    if (hoverRef.value) {
      hoverRef.value.style.transform = 'scale(1)'
      hoverRef.value.style.filter = 'brightness(1)'
    }
  }, 200)
}
</script>

<template>
  <button
    v-if="interactive"
    v-bind="attrs"
    type="button"
    :class="className"
    :disabled="disabled"
    :style="buttonStyle"
    @click="disabled ? undefined : onClick?.()"
  >
    <span
      ref="hoverRef"
      :style="innerStyle"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @touchend="onTouchEnd"
    >
      <span ref="glowRef" :style="glowStyle" />
      <span ref="circleRef" :style="circleStyle" />
    </span>
  </button>

  <div v-else v-bind="attrs" :class="className" :style="rootStyle">
    <span
      ref="hoverRef"
      :style="innerStyle"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @touchend="onTouchEnd"
    >
      <span ref="glowRef" :style="glowStyle" />
      <span ref="circleRef" :style="circleStyle" />
    </span>
  </div>
</template>
