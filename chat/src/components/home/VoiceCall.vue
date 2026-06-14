<template>
    <Transition name="voice-call">
        <div v-if="show" class="voice-call">
            <button class="voice-call-button-close" @click="closeVoiceCallClick">
                <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 8L40 40" stroke="#1b1b1f" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M8 40L40 8" stroke="#1b1b1f" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
            <Orb :state="voiceCallState" :volume="volume" theme="bars" :size="240" />
        </div>
    </Transition>
</template>

<script setup lang="ts" name="VoiceCall">
import { ref } from 'vue';
import { Orb, useAudioVolume } from 'orb-ui';
import type { OrbState } from 'orb-ui';

defineProps({
    show: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:show']);

// 语音通话状态
const voiceCallState = ref<OrbState>('listening');
// 语音通话音量
const { volume, startMic, stop } = useAudioVolume()

/**
 * 关闭语音通话页面
 */
function closeVoiceCallClick() {
    emit('update:show', false);
}
</script>

<style scoped>
.voice-call-enter-active,
.voice-call-leave-active {
    transition: transform 0.3s ease;
}

.voice-call-enter-from,
.voice-call-leave-to {
    transform: translateY(100%);
}

.voice-call {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--ch-bg-color-card);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.voice-call-button-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}
</style>