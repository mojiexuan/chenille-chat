export { Orb } from './components/Orb'
export type { OrbProps, OrbState, OrbTheme, OrbAdapter } from './components/Orb'

// Audio volume composable for controlled-mode usage (custom audio sources).
export { useAudioVolume, createMicMonitor } from './composables/useAudioVolume'
export type { UseAudioVolumeReturn, MicMonitor } from './composables/useAudioVolume'

// Backwards-compat aliases (deprecated — use Orb / OrbProps instead)
export { Orb as VoiceOrb } from './components/Orb'
export type { OrbProps as VoiceOrbProps } from './components/Orb'
