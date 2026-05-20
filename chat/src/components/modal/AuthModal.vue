<template>
    <Teleport to="body">
        <div v-if="isShow" class="auth-modal">
            <div class="auth-modal-content">
                <button class="auth-modal-content-close">
                    <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8L40 40" stroke="#1b1b1f" stroke-width="4" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M8 40L40 8" stroke="#1b1b1f" stroke-width="4" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
                <h2 class="auth-modal-content-title">邮箱验证码登录</h2>
                <section class="auth-modal-content-form">
                    <div class="auth-modal-content-form-item">
                        <input v-model="userEmail" @change="userEmailChange" type="text" placeholder="请输入邮箱"
                            maxlength="50" minlength="4">
                    </div>
                    <div class="auth-modal-content-form-item-tip">{{ emailTip }}</div>
                    <div class="auth-modal-content-form-item">
                        <input v-model="userCode" @change="userCodeChange" type="text" placeholder="请输入验证码"
                            maxlength="6" minlength="6">
                        <span class="auth-modal-content-form-item-separator">|</span>
                        <a class="auth-modal-content-form-item-get-code" :disabled="isDisabledCodeButton"
                            @click="getEmailCode">{{ codeButtonText }}</a>
                    </div>
                    <div class="auth-modal-content-form-item-tip">{{ codeTip }}</div>
                    <button class="auth-modal-content-form-item auth-modal-content-form-item-login"
                        @click="emailLogin">登录</button>
                </section>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts" name="AuthModal">
import { computed, ref } from 'vue';
import { visible } from '@/composables';
import { useUserStore } from '@/stores';
import { isEmail, isNumeric } from '@/utils';
import { emailCodeRequest } from '@/request';

const isShow = computed(() => visible.value);
// 用户store
const userStore = useUserStore();

// 邮箱验证码登录提示
const emailTip = ref('');
const codeTip = ref('');
const userEmail = ref('');
const userCode = ref('');
const codeButtonText = ref('获取验证码');
const isDisabledCodeButton = ref(false);

/**
 * 邮箱输入框改变事件
 */
function userEmailChange() {
    emailTip.value = '';
}

/**
 * 验证码输入框改变事件
 */
function userCodeChange() {
    codeTip.value = '';
}

/**
 * 获取邮箱验证码
 */
async function getEmailCode() {
    if (validateEmail()) {
        emailCodeRequest(userEmail.value)
            .then(() => {
                isDisabledCodeButton.value = true;
                emailTip.value = '';
                codeTip.value = '';
                // 60秒倒计时，从60开始
                let count = 60;
                codeButtonText.value = `重新获取${count}`;
                const timer = setInterval(() => {
                    count--;
                    codeButtonText.value = `重新获取${count}`;
                }, 1000);
                setTimeout(() => {
                    clearInterval(timer);
                    codeButtonText.value = '获取验证码';
                    isDisabledCodeButton.value = false;
                }, 60000);
            })
            .catch(() => {
                codeTip.value = '获取验证码失败';
            })
    }
}

/**
 * 验证邮箱格式
 */
function validateEmail() {
    if (userEmail.value.length < 4 || userEmail.value.length > 50) {
        emailTip.value = '邮箱长度应该在4-50个字符之间';
        return false;
    }
    if (!isEmail(userEmail.value)) {
        emailTip.value = '请输入正确的邮箱格式';
        return false;
    }
}

/**
 * 邮箱登录
 */
async function emailLogin() {
    if (validateEmail()) {
        if (userCode.value.length !== 6) {
            codeTip.value = '请输入6位验证码';
            return false;
        }
        if (!isNumeric(userCode.value)) {
            codeTip.value = '请输入数字验证码';
            return false;
        }
        userStore.emailLogin(userEmail.value, userCode.value)
    }
}
</script>

<style scoped>
.auth-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99999;
    background: var(--ch-mask-active);
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.auth-modal-content {
    position: relative;
    width: 100%;
    background: var(--ch-bg-color-card);
    border-radius: 16px;
    overflow: hidden;
    padding: 32px 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

@media screen and (min-width: 480px) {
    .auth-modal-content {
        width: 460px;
        padding: 32px 70px;
    }
}

.auth-modal-content-close {
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

.auth-modal-content-title {
    color: var(--ch-text-color-1);
    user-select: none;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
    margin: 8px 0 24px 0;
}

.auth-modal-content-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.auth-modal-content-form-item {
    width: 100%;
    height: 48px;
    padding: 8px 13px;
    border: 1px solid var(--ch-line-color);
    border-radius: 8px;
    font-size: 16px;
    display: flex;
    align-items: center;
}

.auth-modal-content-form-item-tip {
    width: 100%;
    height: 24px;
    font-size: 12px;
    color: var(--ch-tip-error-color);
}

.auth-modal-content-form-item input {
    flex: 1 1;
    padding: 0;
}

.auth-modal-content-form-item-separator {
    color: var(--ch-line-color);
    user-select: none;
}

.auth-modal-content-form-item-get-code {
    color: var(--ch-text-color-1);
    user-select: none;
    width: 100px;
    font-size: 16px;
    text-align: center;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
}

.auth-modal-content-form-item-get-code[disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
}

.auth-modal-content-form-item-login {
    background-color: var(--ch-main-color);
    border: 1px solid var(--ch-main-color);
    color: var(--ch-text-white-color);
    user-select: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
}

.auth-modal-content-form-item-login:hover {
    background-color: var(--ch-main-hover-color);
}

@media screen and (min-width: 768px) {}

@media screen and (min-width: 1024px) {}

@media screen and (min-width: 1280px) {}
</style>