import { ref, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import { normalizeMicVolume } from '../adapters/types'

// ─── Mic monitor (internal) ─────────────────────────────────────────────────
// Shared mic volume monitoring via Web Audio API. Runs at 60fps when active.
// Lives here (not in adapters) so it's provider-agnostic — no mic code in adapters.
//
// This is the low-level engine the Orb component uses internally. It intercepts
// getUserMedia to capture whatever mic stream an adapter's SDK acquires, so the
// Orb can visualize the user's voice during `listening` without any mic code in
// the adapters themselves.

export interface MicMonitor {
  /** Begin polling volume at ~60fps; calls onVolume with a normalized 0–1 value. */
  start: (onVolume: (v: number) => void) => void
  /** Stop the polling loop (keeps the captured stream + AudioContext alive). */
  stop: () => void
  /** Fully tear down: stop polling, close the AudioContext, stop mic tracks. */
  release: () => void
}

/**
 * Creates a mic monitor that captures the stream from getUserMedia (by
 * intercepting navigator.mediaDevices.getUserMedia) and exposes a normalized
 * 0–1 volume via a polling callback.
 *
 * Used internally by Orb. Prefer {@link useAudioVolume} for app code.
 */
export function createMicMonitor(): MicMonitor {
  let context: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let source: MediaStreamAudioSourceNode | null = null
  let raf: number = 0
  let ema = 0
  let stream: MediaStream | null = null

  // Intercept getUserMedia to capture the mic stream
  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
    const _origGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const s = await _origGUM(constraints)
      if (constraints?.audio) stream = s
      return s
    }
  }

  function start(onVolume: (v: number) => void) {
    if (!stream || analyser) return
    try {
      context = new AudioContext()
      analyser = context.createAnalyser()
      analyser.fftSize = 256
      source = context.createMediaStreamSource(stream)
      source.connect(analyser)
      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const poll = () => {
        if (!analyser) return
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]! * dataArray[i]!
        const rms = Math.sqrt(sum / dataArray.length) / 255
        const rate = rms > ema ? 0.7 : 0.3
        ema += (rms - ema) * rate
        onVolume(normalizeMicVolume(ema))
        raf = requestAnimationFrame(poll)
      }
      raf = requestAnimationFrame(poll)
    } catch (e) {
      console.warn('[orb-ui] Mic monitor failed:', e)
    }
  }

  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
    ema = 0
    source?.disconnect()
    source = null
    analyser = null
  }

  function release() {
    stop()
    if (context) {
      context.close().catch(() => {})
      context = null
    }
    stream?.getTracks().forEach((track) => {
      if (track.readyState === 'live') track.stop()
    })
    stream = null
  }

  return { start, stop, release }
}

// ─── useAudioVolume (public composable) ─────────────────────────────────────

export interface UseAudioVolumeReturn {
  /** Reactive normalized volume (0–1). Pass straight into <Orb :volume="volume" />. */
  volume: Ref<number>
  /** Analyze an existing MediaStream (e.g. mic, WebRTC track, screen audio). */
  start: (stream: MediaStream) => void
  /** Request the mic via getUserMedia and start analyzing it. Must be called from a user gesture. */
  startMic: () => Promise<void>
  /**
   * Analyze the audio of an HTMLMediaElement (<audio>/<video>) while keeping it
   * audible. Safe to call repeatedly on the same element — the underlying source
   * node is created once and cached.
   */
  startElement: (el: HTMLMediaElement) => void
  /**
   * Stop visualizing: cancels the loop, zeroes the volume, and stops any mic this
   * composable opened via startMic(). Keeps the AudioContext + cached element
   * sources alive so you can start again cheaply (e.g. mic → AI → mic). Element
   * audio you routed through startElement stays audible.
   */
  stop: () => void
  /** Fully tear down: stop, close the AudioContext, drop cached element sources. Called automatically on unmount. */
  release: () => void
}

/**
 * Reactive audio volume for controlled-mode Orb usage.
 *
 * The volume curve (RMS → noise-shaped EMA → 0–1) is identical to what the Orb
 * uses internally in adapter mode, so a controlled Orb driven by this composable
 * animates the same way an adapter-driven one does.
 *
 * Designed for switching between sources during a session — e.g. analyze the mic
 * while the user speaks (`listening`), then the AI's audio while it replies
 * (`speaking`). A single AudioContext is reused across switches, and element
 * source nodes are cached, so repeated startElement() on the same element never
 * throws InvalidStateError.
 *
 * @example
 * const state = ref<OrbState>('idle')
 * const { volume, startMic, startElement, stop } = useAudioVolume()
 *
 * async function userTurn() {
 *   state.value = 'listening'
 *   await startMic()
 * }
 *
 * function aiTurn(el: HTMLAudioElement) {
 *   state.value = 'speaking'
 *   startElement(el)
 * }
 *
 * // <Orb theme="circle" :state="state" :volume="volume" />
 */
export function useAudioVolume(): UseAudioVolumeReturn {
  const volume = ref(0)

  // One AudioContext for the whole composable lifetime — reused across source
  // switches instead of being opened/closed each time.
  let context: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  // The node currently feeding the analyser. Disconnected from the analyser (but
  // not destroyed) when we switch sources.
  let activeSource: AudioNode | null = null
  let raf = 0
  let ema = 0

  // Tracks we opened ourselves (via startMic) — stopped on stop()/release().
  // Streams handed in via start() are owned by the caller and left alone.
  let ownedStream: MediaStream | null = null

  // createMediaElementSource may be called only ONCE per element for the lifetime
  // of an AudioContext — a second call throws InvalidStateError. Cache the node
  // per element so repeated startElement(sameEl) reuses it.
  const elementSources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>()

  function ensureContext(): AudioContext {
    if (!context) {
      context = new AudioContext()
      analyser = context.createAnalyser()
      analyser.fftSize = 256
    }
    return context
  }

  function beginLoop() {
    if (!analyser) return
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const poll = () => {
      if (!analyser) return
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]! * dataArray[i]!
      const rms = Math.sqrt(sum / dataArray.length) / 255
      // EMA: fast attack (0.7), slow release (0.3) — matches the Orb's mic monitor
      const rate = rms > ema ? 0.7 : 0.3
      ema += (rms - ema) * rate
      volume.value = normalizeMicVolume(ema)
      raf = requestAnimationFrame(poll)
    }
    raf = requestAnimationFrame(poll)
  }

  // Stop the current visualization loop and detach the active source from the
  // analyser, WITHOUT closing the context or destroying cached element sources.
  function detach() {
    cancelAnimationFrame(raf)
    raf = 0
    ema = 0
    volume.value = 0
    if (activeSource && analyser) {
      try {
        activeSource.disconnect(analyser)
      } catch {
        // already disconnected
      }
    }
    activeSource = null
  }

  function start(stream: MediaStream) {
    detach()
    try {
      ensureContext()
      activeSource = context!.createMediaStreamSource(stream)
      activeSource.connect(analyser!)
      beginLoop()
    } catch (e) {
      console.warn('[orb-ui] useAudioVolume.start failed:', e)
    }
  }

  async function startMic() {
    // If a mic this composable opened is still live, reuse it.
    if (!ownedStream || !ownedStream.getTracks().some((t) => t.readyState === 'live')) {
      ownedStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    }
    start(ownedStream)
  }

  function startElement(el: HTMLMediaElement) {
    detach()
    try {
      ensureContext()
      let elSource = elementSources.get(el)
      if (!elSource) {
        elSource = context!.createMediaElementSource(el)
        // Route the element to the speakers ONCE — this connection persists across
        // detach()/start() so the audio stays audible regardless of visualization.
        elSource.connect(context!.destination)
        elementSources.set(el, elSource)
      }
      // Tap the signal for analysis (separate from the destination connection above).
      elSource.connect(analyser!)
      activeSource = elSource
      beginLoop()
    } catch (e) {
      console.warn('[orb-ui] useAudioVolume.startElement failed:', e)
    }
  }

  function stop() {
    detach()
    // Stop any mic we opened, but keep the context + cached element sources so a
    // subsequent start()/startElement() is cheap.
    ownedStream?.getTracks().forEach((track) => {
      if (track.readyState === 'live') track.stop()
    })
    ownedStream = null
  }

  function release() {
    stop()
    analyser = null
    if (context) {
      context.close().catch(() => {})
      context = null
    }
  }

  onBeforeUnmount(release)

  return { volume, start, startMic, startElement, stop, release }
}
