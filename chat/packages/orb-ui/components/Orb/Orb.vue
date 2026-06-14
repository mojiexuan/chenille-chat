<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, useAttrs, computed } from 'vue'
import type { OrbProps, OrbState, OrbAdapter } from './Orb.types'
import { createMicMonitor } from '../../composables/useAudioVolume'
import DebugTheme from '../../themes/debug/DebugTheme.vue'
import CircleTheme from '../../themes/circle/CircleTheme.vue'
import BarsTheme from '../../themes/bars/BarsTheme.vue'

defineOptions({ inheritAttrs: false })

// ─── Orb component ────────────────────────────────────────────────────────────

// defineProps only declares Orb's own props. HTML attributes (id/title/role/
// data-*/aria-*) are intentionally left out so they fall through to attrs and
// get forwarded to the rendered DOM node — mirroring React's `...htmlProps`.
// The exported public OrbProps type still includes them for consumer typing.
const props = withDefaults(
  defineProps<{
    state?: OrbState
    volume?: number
    adapter?: OrbAdapter
    theme?: OrbProps['theme']
    size?: number
    className?: string
    style?: OrbProps['style']
    disabled?: boolean
    onStart?: () => void
    onStop?: () => void
  }>(),
  {
    theme: 'debug',
    size: 200,
    disabled: false,
  },
)

const attrs = useAttrs()

const adapterState = ref<OrbState>('idle')
const adapterVolume = ref(0)
const micVolume = ref(0)
const micMonitor = createMicMonitor()
const micActiveRef = { current: false }

// Subscribe to adapter; reset on adapter change (React: useEffect on [adapter])
let unsubscribe: (() => void) | undefined
function subscribeAdapter() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = undefined
  }

  // Reset state when adapter changes (e.g. provider switch)
  adapterState.value = 'idle'
  adapterVolume.value = 0
  micVolume.value = 0

  if (!props.adapter) return
  unsubscribe = props.adapter.subscribe({
    onStateChange: (s) => {
      adapterState.value = s
    },
    onVolumeChange: (v) => {
      adapterVolume.value = v
    },
  })
}

onMounted(subscribeAdapter)
watch(() => props.adapter, subscribeAdapter)

// Controlled props override adapter values
const state = computed<OrbState>(() => props.state ?? adapterState.value)

// Mic monitor: start when listening, stop otherwise (React: useEffect on [state, adapter])
// micCleanup mirrors the function React's useEffect returns — run before the next
// effect and on unmount so listening→other transitions always tear down cleanly.
let micTimer: ReturnType<typeof setTimeout> | null = null
let micCleanup: (() => void) | null = null

function runMicCleanup() {
  if (micCleanup) {
    micCleanup()
    micCleanup = null
  }
}

function micEffect(s: OrbState, adapter: OrbProps['adapter']) {
  const mic = micMonitor

  if (s === 'listening' && adapter) {
    // Small delay to let the adapter's SDK acquire the mic first
    micTimer = setTimeout(() => {
      mic.start((v) => {
        micVolume.value = v
      })
      micActiveRef.current = true
    }, 500)
    micCleanup = () => {
      if (micTimer) {
        clearTimeout(micTimer)
        micTimer = null
      }
      mic.stop()
      micActiveRef.current = false
      micVolume.value = 0
    }
  } else {
    mic.stop()
    micActiveRef.current = false
    micVolume.value = 0
  }
}

watch(
  [state, () => props.adapter],
  ([s, adapter]) => {
    runMicCleanup()
    micEffect(s, adapter)
  },
  { immediate: true },
)

// Release mic on unmount
onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
  runMicCleanup()
  micMonitor.release()
})

// Use mic volume when listening, adapter volume otherwise
const volume = computed<number>(
  () =>
    props.volume ??
    (state.value === 'listening' && micActiveRef.current ? micVolume.value : adapterVolume.value),
)

const isActive = computed(() => state.value !== 'idle' && state.value !== 'error')

function handleClick() {
  if (props.disabled) return

  if (isActive.value) {
    if (props.onStop) props.onStop()
    else props.adapter?.stop?.()
  } else {
    if (props.onStart) props.onStart()
    else props.adapter?.start?.()
  }
}

// Only render a clickable control when the current state can be handled.
// Disabled controls stay semantic buttons but do not fire handlers.
const interactive = computed(() =>
  isActive.value
    ? !!(props.adapter?.stop || props.onStop)
    : !!(props.adapter?.start || props.onStart),
)
const clickHandler = computed(() =>
  interactive.value && !props.disabled ? handleClick : undefined,
)

// Resolve aria-label: explicit attr wins, else generated when interactive.
const ariaLabel = computed(() => {
  const explicit = attrs['aria-label'] as string | undefined
  return (
    explicit ??
    (interactive.value ? `${isActive.value ? 'Stop' : 'Start'} voice session` : undefined)
  )
})

// htmlProps minus aria-label (we resolve it explicitly above)
const controlAttrs = computed(() => {
  const rest: Record<string, unknown> = { ...attrs }
  delete rest['aria-label']
  return rest
})

// Debug start/stop handlers (mirror React inline arrows)
const debugOnStart = computed(() =>
  props.disabled ? undefined : (props.onStart ?? (() => props.adapter?.start?.())),
)
const debugOnStop = computed(() =>
  props.disabled ? undefined : (props.onStop ?? (() => props.adapter?.stop?.())),
)
</script>

<template>
  <CircleTheme
    v-if="theme === 'circle'"
    v-bind="controlAttrs"
    :aria-label="ariaLabel"
    :state="state"
    :volume="volume"
    :size="size"
    :class-name="className"
    :style="style"
    :disabled="disabled"
    :interactive="interactive"
    :on-click="clickHandler"
  />

  <BarsTheme
    v-else-if="theme === 'bars'"
    v-bind="controlAttrs"
    :aria-label="ariaLabel"
    :state="state"
    :volume="volume"
    :size="size"
    :class-name="className"
    :style="style"
    :disabled="disabled"
    :interactive="interactive"
    :on-click="clickHandler"
  />

  <DebugTheme
    v-else
    v-bind="controlAttrs"
    :state="state"
    :volume="volume"
    :size="size"
    :class-name="className"
    :style="style"
    :disabled="disabled"
    :on-start="debugOnStart"
    :on-stop="debugOnStop"
  />
</template>
