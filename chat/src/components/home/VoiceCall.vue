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
            <!-- 语音通话内容区 -->
            <div class="voice-call-container">
                <Orb :state="voiceCallState" :volume="volume" theme="bars" :size="240" />
                <!-- 弹幕 -->
                <div class="voice-call-container-bullet-chat">
                    <span>点击下方按钮开始与我聊天吧~</span>
                </div>
                <!-- 状态 -->
                <!-- 拨出 -->
                <div v-if="voiceCallState === 'idle'" class="voice-call-container-dial-out">
                    <!-- 拨出 -->
                    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M16.9961 7.68583C17.7227 7.68583 18.3921 8.07985 18.7448 8.71509L21.1912 13.1219C21.5115 13.6989 21.5266 14.3968 21.2314 14.9871L18.8746 19.7008C18.8746 19.7008 19.5576 23.2122 22.416 26.0706C25.2744 28.929 28.7741 29.6002 28.7741 29.6002L33.487 27.2438C34.0777 26.9484 34.7761 26.9637 35.3533 27.2846L39.7726 29.7416C40.4072 30.0945 40.8008 30.7635 40.8008 31.4896L40.8008 36.5631C40.8008 39.1468 38.4009 41.0129 35.9528 40.1868C30.9249 38.4903 23.1202 35.2601 18.1734 30.3132C13.2265 25.3664 9.99631 17.5617 8.29977 12.5338C7.47375 10.0857 9.33984 7.68583 11.9235 7.68583L16.9961 7.68583Z"
                            fill="#ffffff" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" />
                    </svg>
                </div>
                <!-- 其余 -->
                <div v-else class="voice-call-container-other">
                    <!-- 麦克风控制 -->
                    <div class="voice-call-container-other-mic">
                        <!-- 开启 -->
                        <svg v-if="microphoneActive" width="20" height="20" viewBox="0 0 48 48" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <rect x="17" y="4" width="14" height="27" rx="7" fill="none" stroke="#3c3c43"
                                stroke-width="4" stroke-linejoin="round" />
                            <path d="M9 23C9 31.2843 15.7157 38 24 38C32.2843 38 39 31.2843 39 23" stroke="#3c3c43"
                                stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M24 38V44" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        <!-- 关闭 -->
                        <svg v-else width="20" height="20" viewBox="0 0 48 48" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M31 24V11C31 7.13401 27.866 4 24 4C20.134 4 17 7.13401 17 11V24C17 27.866 20.134 31 24 31C27.866 31 31 27.866 31 24Z"
                                stroke="#3c3c43" stroke-width="4" stroke-linejoin="round" />
                            <path
                                d="M9 23C9 31.2843 15.7157 38 24 38C25.7532 38 27.4361 37.6992 29 37.1465M39 23C39 25.1333 38.5547 27.1626 37.7519 29"
                                stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M24 38V44" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M42 42L6 6" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <!-- 录音时间 -->
                    <div class="voice-call-container-other-mic-time">
                        <span>00:00</span>
                    </div>
                    <!-- 挂断 -->
                    <div class="voice-call-container-other-hang-up">
                        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M15.9961 8.68583C16.7227 8.68583 17.3921 9.07985 17.7448 9.71509L20.1912 14.1219C20.5115 14.6989 20.5266 15.3968 20.2314 15.9871L17.8746 20.7008C17.8746 20.7008 18.5576 24.2122 21.416 27.0706C24.2744 29.929 27.7741 30.6002 27.7741 30.6002L32.487 28.2438C33.0777 27.9484 33.7761 27.9637 34.3533 28.2846L38.7726 30.7416C39.4072 31.0945 39.8008 31.7635 39.8008 32.4896L39.8008 37.5631C39.8008 40.1468 37.4009 42.0129 34.9528 41.1868C29.9249 39.4903 22.1202 36.2601 17.1734 31.3132C12.2265 26.3664 8.99631 18.5617 7.29977 13.5338C6.47375 11.0857 8.33984 8.68583 10.9235 8.68583L15.9961 8.68583Z"
                                fill="#ffffff" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" />
                            <rect opacity="0.01" x="28" y="7" width="13" height="13" fill="#FFF" />
                            <path d="M39 9L30 18" stroke="#ffffff" stroke-width="4" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M30 9L39 18" stroke="#ffffff" stroke-width="4" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
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
const voiceCallState = ref<OrbState>('idle');
// 语音通话音量
const { volume, startMic, stop } = useAudioVolume();
// 麦克风状态
const microphoneActive = ref(false);

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

.voice-call-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50%;
    max-width: 80%;
}

.voice-call-container-bullet-chat {
    flex: 1;
    font-size: 20px;
    color: var(--ch-text-color-2);
    user-select: none;
}

.voice-call-container-dial-out {
    width: 58px;
    height: 58px;
    background-color: var(--ch-tip-success-color);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.voice-call-container-dial-out:active {
    transform: scale(0.9);
}

.voice-call-container-other {
    display: flex;
    align-items: center;
    gap: 10px;
}

.voice-call-container-other-mic {
    width: 58px;
    height: 58px;
    background-color: var(--ch-bg-color-card);
    border: 1px solid var(--ch-border-card-color);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.voice-call-container-other-mic:active {
    transform: scale(0.9);
}

.voice-call-container-other-mic-time {
    width: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
}

.voice-call-container-other-hang-up {
    width: 58px;
    height: 58px;
    background-color: var(--ch-tip-error-color);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.voice-call-container-other-hang-up:active {
    transform: scale(0.9);
}
</style>