<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { OrbState } from '../../components/Orb/Orb.types'

interface DebugThemeProps {
  state: OrbState
  volume: number
  size: number
  className?: string
  style?: CSSProperties
  disabled?: boolean
  onStart?: () => void
  onStop?: () => void
}

const props = withDefaults(defineProps<DebugThemeProps>(), {
  disabled: false,
})

const ALL_STATES: OrbState[] = ['idle', 'connecting', 'listening', 'speaking', 'error']

const STATE_COLORS: Record<OrbState, string> = {
  idle: '#888',
  connecting: '#f0c040',
  listening: '#40c0f0',
  speaking: '#40f080',
  error: '#f04040',
}

// Note: forcing state from the debug panel requires controlled mode.
// In controlled mode, wire onStateChange to your own state.
function forceState(s: OrbState) {
  console.warn(`[orb-ui debug] To force state '${s}', use controlled mode: <Orb state="${s}" />`)
}
</script>

<template>
  <div
    :class="className"
    :style="{
      width: `${size}px`,
      fontFamily: 'monospace',
      fontSize: '12px',
      background: '#111',
      color: '#ccc',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '12px',
      boxSizing: 'border-box',
      userSelect: 'none',
      ...style,
    }"
  >
    <!-- Header -->
    <div :style="{ color: '#555', marginBottom: '10px', fontSize: '10px', letterSpacing: '1px' }">
      ORB DEBUG
    </div>

    <!-- State -->
    <div :style="{ marginBottom: '8px' }">
      <span :style="{ color: '#555' }">state </span>
      <span :style="{ color: STATE_COLORS[state], fontWeight: 'bold' }">{{ state }}</span>
    </div>

    <!-- Volume -->
    <div :style="{ marginBottom: '10px' }">
      <span :style="{ color: '#555' }">volume </span>
      <span :style="{ color: '#ccc' }">{{ volume.toFixed(2) }}</span>
      <div
        :style="{
          marginTop: '4px',
          height: '4px',
          background: '#222',
          borderRadius: '2px',
          overflow: 'hidden',
        }"
      >
        <div
          :style="{
            height: '100%',
            width: `${volume * 100}%`,
            background: STATE_COLORS[state],
            borderRadius: '2px',
            transition: 'width 50ms linear',
          }"
        />
      </div>
    </div>

    <!-- State buttons -->
    <div :style="{ marginBottom: '10px' }">
      <div :style="{ color: '#555', marginBottom: '4px', fontSize: '10px' }">force state</div>
      <div :style="{ display: 'flex', flexWrap: 'wrap', gap: '4px' }">
        <button
          v-for="s in ALL_STATES"
          :key="s"
          :disabled="disabled"
          :style="{
            fontSize: '10px',
            padding: '2px 6px',
            background: state === s ? STATE_COLORS[s] : '#222',
            color: state === s ? '#000' : '#888',
            border: `1px solid ${state === s ? STATE_COLORS[s] : '#333'}`,
            borderRadius: '3px',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }"
          @click="forceState(s)"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <!-- Start / Stop -->
    <div :style="{ display: 'flex', gap: '6px' }">
      <button
        :disabled="disabled"
        :style="{
          flex: 1,
          padding: '4px 0',
          background: '#1a3a1a',
          color: '#40f080',
          border: '1px solid #40f080',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '11px',
        }"
        @click="onStart?.()"
      >
        Start
      </button>
      <button
        :disabled="disabled"
        :style="{
          flex: 1,
          padding: '4px 0',
          background: '#3a1a1a',
          color: '#f04040',
          border: '1px solid #f04040',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '11px',
        }"
        @click="onStop?.()"
      >
        Stop
      </button>
    </div>
  </div>
</template>
