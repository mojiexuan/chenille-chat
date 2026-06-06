<template>
    <div class="setting">
        <!-- 用户资料 -->
        <div class="setting-card setting-card-user" @click="handleProfileClick">
            <div class="setting-card-item setting-card-item-user">
                <img class="setting-card-item-user-avatar" :src="userStore.user.avatar"
                    :alt="userStore.user.nickname" />
                <div class="setting-card-item-user-info">
                    <div class="setting-card-item-user-info-nickname ellipsis">{{ userStore.user.nickname }}</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12L31 24L19 36" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </div>
        </div>
        <!-- 退出登录 -->
        <a class="setting-button-item setting-button-item-logout" @click="logoutClick">退出登录</a>
    </div>
</template>

<script setup lang="ts" name="setting">
import { useConfirm } from '@/composables';
import { useUserStore } from '@/stores';
import { useRouter } from 'vue-router';

// 确认弹窗
const confirm = useConfirm();
// 用户store
const userStore = useUserStore();
// 路由
const router = useRouter();

/**
 * 用户资料点击事件
 */
function handleProfileClick() {
    router.push({ name: 'Profile' });
}

/**
 * 退出登录点击事件
 */
function logoutClick() {
    confirm.error({
        title: '确认退出登录',
        message: '退出登录不会丢失任何数据，你仍可以登录此账号',
        onConfirm: () => {
            userStore.logout();
        }
    })
}
</script>

<style scoped>
.setting {
    max-width: 550px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-top: 12px;
    gap: 24px;
}

.setting-card {
    width: 100%;
    background-color: var(--ch-feature-card-bg);
    min-height: 48px;
    padding: 0 16px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

.setting-card-user {
    cursor: pointer;
}

.setting-card-item {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.setting-card-item-user {
    padding: 16px 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.setting-card-item-user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.setting-card-item-user-info {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.setting-card-item-user-info-nickname {
    font-size: 16px;
    font-weight: 400;
    font-weight: 400;
    line-height: 24px;
    user-select: none;
}

.setting-button-item {
    background-color: var(--ch-feature-card-bg);
    min-height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    user-select: none;
}

.setting-button-item:hover {
    background-color: var(--ch-feature-card-hover-bg);
}

.setting-button-item-logout {
    color: var(--ch-tip-error-color);
    font-size: 16px;
    line-height: 24px;
    border-radius: 8px;
    justify-content: center;
    cursor: pointer;
}
</style>