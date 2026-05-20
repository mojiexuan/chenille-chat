<template>
    <Teleport to="body">
        <Transition name="toast">
            <div v-if="toastState.visible" class="toast" role="alert">
                <img :src="currentIcon" class="toast-icon" alt="" />
                <span class="toast-text">{{ toastState.message }}</span>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { IconType } from '@/composables';
import { toastState } from '@/composables';

import errorIcon from '@/assets/toast/toast_error.png';
import promptIcon from '@/assets/toast/toast_prompt.png';
import successIcon from '@/assets/toast/toast_success.png';
import warningIcon from '@/assets/toast/toast_warning.png';

const iconMap: Record<IconType, string> = {
    success: successIcon,
    prompt: promptIcon,
    warning: warningIcon,
    error: errorIcon,
    loading: successIcon,
};

const currentIcon = computed(() => iconMap[toastState.icon] ?? successIcon);
</script>

<style scoped>
.toast {
    position: fixed;
    top: 64px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    padding: 12px 20px;
    box-sizing: border-box;
    width: max-content;
    max-width: min(360px, 85vw);
    border-radius: 50px;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    color: #333;
}

.toast-icon {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    flex-shrink: 0;
}

.toast-text {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    word-break: break-word;
}

/* 动画 */
.toast-enter-active {
    transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}

.toast-leave-active {
    transition: all 0.25s ease-in;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(-16px);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-12px);
}

/* 响应式 */
@media (max-width: 480px) {
    .toast {
        top: 48px;
        padding: 10px 18px;
    }

    .toast-icon {
        width: 18px;
        height: 18px;
    }

    .toast-text {
        font-size: 13px;
    }
}
</style>