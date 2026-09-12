<template>
    <Teleport to="body">
        <div v-if="confirmState.visible" class="confirm-dialog">
            <div class="confirm-dialog-container">
                <div class="confirm-dialog-container-top">
                    <img v-if="currentIcon" class="confirm-dialog-container-top-icon" :src="currentIcon"
                        :alt="confirmState.title" />
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
                <div v-if="confirmState.message" class="confirm-dialog-container-content">{{ confirmState.message }}
                </div>
                <!-- 编辑框 -->
                <div v-if="confirmState.edit" class="confirm-dialog-container-edit">
                    <textarea class="confirm-dialog-container-edit-input" v-model="editValue"
                        :placeholder="confirmState.edit.placeholder || '请输入'"
                        :maxlength="confirmState.edit.maxlength || 300" :minlength="confirmState.edit.minlength || 0"
                        spellcheck="false" autocapitalize="off" autocomplete="off" enterkeyhint="enter"
                        @keydown="handleKeyDown"></textarea>
                </div>
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
import { computed, ref } from 'vue';
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

const currentIcon = computed(() => confirmState.icon ? iconMap[confirmState.icon] ?? successIcon : null);
// 编辑框值
const editValue = ref("");

/**
 * 关闭弹窗
 */
const closeDialog = () => {
    confirmState.visible = false;
    editValue.value = "";
    confirmState.icon = undefined;
    confirmState.edit = undefined;
    confirmState.message = undefined;
    confirmState.title = "确认操作吗？";
    confirmState.confirmText = "确认";
    confirmState.cancelText = "取消";
    confirmState.showCancelButton = true;
    confirmState.onCancel?.();
}

/**
 * 取消点击事件
 * @param e 事件对象
 */
const cancelClick = (e: MouseEvent) => {
    e.stopPropagation();
    closeDialog();
}

/**
 * 确认点击事件
 * @param e 事件对象
 */
const confirmClick = (e: MouseEvent) => {
    e.stopPropagation();
    // 确认事件参数
    const params = confirmState.edit ? { edit: { value: editValue.value } } : {};
    confirmState.onConfirm?.(params);
    closeDialog();
}

/**
 * 处理键盘事件
 * @param e 事件对象
 */
const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        // 确认事件参数
        const params = confirmState.edit ? { edit: { value: editValue.value } } : {};
        confirmState.onConfirm?.(params);
        closeDialog();
    }
}
</script>

<style scoped>
.confirm-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 8888;
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
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    user-select: none;
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
    font-size: 14px;
    user-select: none;
}

.confirm-dialog-container-edit {
    display: grid;
    border: 1px solid var(--ch-border-card-color);
    border-radius: 8px;
    max-height: 112px;
    min-height: 112px;
    overflow: hidden;
    padding: 12px;
}

.confirm-dialog-container-edit-input {
    font-size: 14px;
    line-height: 22px;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    resize: none;
}

.confirm-dialog-container-bottom {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 16px;
}

.confirm-dialog-container-bottom-button {
    height: 36px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    padding: 0 15px;
    user-select: none;
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
    background-color: var(--ch-black-bg-white);
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