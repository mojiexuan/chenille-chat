<template>
    <Teleport to="body">
        <div v-if="confirmState.visible" class="confirm-dialog">
            <div class="confirm-dialog-container">
                <div class="confirm-dialog-container-top">
                    <img class="confirm-dialog-container-top-icon" :src="currentIcon" :alt="confirmState.title" />
                    <span class="confirm-dialog-container-top-title ellipsis">{{ confirmState.title }}</span>
                    <div class="confirm-dialog-container-top-close" @click="cancelClick">
                        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 14L34 34" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M14 34L34 14" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
                <div class="confirm-dialog-container-content">{{ confirmState.message }}</div>
                <div class="confirm-dialog-container-bottom">
                    <button class="confirm-dialog-container-bottom-button confirm-dialog-container-bottom-button-cancel"
                        @click="cancelClick">取消</button>
                    <button
                        class="confirm-dialog-container-bottom-button confirm-dialog-container-bottom-button-confirm"
                        :class="confirmState.icon" @click="confirmClick">确认</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts" name="ConfirmDialog">
import { computed } from 'vue';
import type { ConfirmIconType } from '@/composables';
import { confirmState } from '@/composables';

import errorIcon from '@/assets/toast/toast_error.png';
import promptIcon from '@/assets/toast/toast_prompt.png';
import successIcon from '@/assets/toast/toast_success.png';
import warningIcon from '@/assets/toast/toast_warning.png';

const iconMap: Record<ConfirmIconType, string> = {
    success: successIcon,
    prompt: promptIcon,
    warning: warningIcon,
    error: errorIcon,
};

const currentIcon = computed(() => iconMap[confirmState.icon] ?? successIcon);

/**
 * 取消点击事件
 * @param e 事件对象
 */
const cancelClick = (e: MouseEvent) => {
    e.stopPropagation();
    confirmState.visible = false;
    confirmState.onCancel?.(e);
}

/**
 * 确认点击事件
 * @param e 事件对象
 */
const confirmClick = (e: MouseEvent) => {
    e.stopPropagation();
    confirmState.visible = false;
    confirmState.onConfirm?.(e);
}
</script>

<style scoped>
.confirm-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    background: var(--ch-mask-active);
    padding: 16px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.confirm-dialog-container {
    background-color: var(--ch-bg-color-card);
    border-radius: 12px;
    padding: 24px;
    width: 480px;
    max-width: 90vw;
}

.confirm-dialog-container-top {
    display: flex;
    align-items: center;
    gap: 8px;
}

.confirm-dialog-container-top-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
}

.confirm-dialog-container-top-title {
    font-size: 18px;
    font-weight: 600;
    flex: 1;
}

.confirm-dialog-container-top-close {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.confirm-dialog-container-content {
    padding: 16px 0 32px 0;
    font-size: 14px;
}

.confirm-dialog-container-bottom {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
}

.confirm-dialog-container-bottom-button {
    height: 36px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    padding: 0 15px;
}

.confirm-dialog-container-bottom-button-cancel {
    color: var(--ch-black-bg-white);
    background-color: var(--ch-feature-card-bg);
}

.confirm-dialog-container-bottom-button-cancel:hover {
    background-color: var(--ch-feature-card-hover-bg);
}

.confirm-dialog-container-bottom-button-confirm {
    color: var(--ch-white-bg-black);
}

.confirm-dialog-container-bottom-button-confirm.success {
    background-color: var(--ch-tip-success-color);
}

.confirm-dialog-container-bottom-button-confirm:hover.success {
    background-color: var(--ch-tip-success-hover-color);
}

.confirm-dialog-container-bottom-button-confirm.prompt {
    background-color: var(--ch-tip-prompt-color);
}

.confirm-dialog-container-bottom-button-confirm:hover.prompt {
    background-color: var(--ch-tip-prompt-hover-color);
}

.confirm-dialog-container-bottom-button-confirm.warning {
    background-color: var(--ch-tip-warning-color);
}

.confirm-dialog-container-bottom-button-confirm:hover.warning {
    background-color: var(--ch-tip-warning-hover-color);
}

.confirm-dialog-container-bottom-button-confirm.error {
    background-color: var(--ch-tip-error-color);
}

.confirm-dialog-container-bottom-button-confirm:hover.error {
    background-color: var(--ch-tip-error-hover-color);
}
</style>