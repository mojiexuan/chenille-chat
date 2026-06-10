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
        <!-- token 数据 -->
        <div v-if="userStore.user.usageToken" class="setting-card-token">
            <div class="setting-card-token-item">
                <h4>总消耗token</h4>
                <div class="setting-card-token-item-content">
                    <span>{{ userStore.user.usageToken.totalTokens }}</span>
                </div>
            </div>
            <div class="setting-card-token-item">
                <h4>总命中缓存token</h4>
                <div class="setting-card-token-item-content">
                    <span>{{ userStore.user.usageToken.cachedTokens }}</span>
                </div>
            </div>
            <div class="setting-card-token-item">
                <h4>总缓存命中率</h4>
                <div class="setting-card-token-item-content">
                    <span>
                        {{ userStore.user.usageToken.cacheHitRate }}
                        <span class="setting-card-token-item-content-percent">%</span>
                    </span>
                </div>
            </div>
        </div>
        <!-- 数据管理 -->
        <div class="setting-block">
            <h3>数据管理</h3>
            <div class="setting-card">
                <!-- 位置 -->
                <div class="setting-card-item">
                    <span class="setting-card-item-name">位置</span>
                </div>
            </div>
        </div>
        <!-- 帮助与反馈 -->
        <div class="setting-block">
            <h3>帮助与反馈</h3>
            <div class="setting-card">
                <!-- 意见反馈 -->
                <a class="setting-card-item" href="https://txc.qq.com/products/800853" target="_blank">
                    <span class="setting-card-item-name">意见反馈</span>
                    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12L31 24L19 36" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </a>
            </div>
        </div>
        <!-- 退出登录 -->
        <a class="setting-button-item setting-button-item-logout" @click="logoutClick">退出登录</a>
    </div>
</template>

<script setup lang="ts" name="setting">
import { useConfirm } from '@/composables';
import { useUserStore } from '@/stores';
import { onMounted } from 'vue';
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

onMounted(() => {
    userStore.getUserUsageAiToken();
})
</script>

<style scoped>
.setting {
    width: 550px;
    max-width: 550px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-top: 12px;
    gap: 24px;
    user-select: none;
}

.setting-block {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.setting-card {
    width: 100%;
    background-color: var(--ch-feature-card-bg);
    min-height: 48px;
    padding: 0 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
}

.setting-card-user {
    cursor: pointer;
}

.setting-card-item {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
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

.setting-card-token {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.setting-card-token-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background-color: var(--ch-feature-card-bg);
    border-radius: 8px;
    min-height: 48px;
    padding: 16px 16px;
}

.setting-card-token-item h4 {
    font-size: 14px;
}

.setting-card-token-item-content {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 400;
    padding: 16px 0;
    color: var(--ch-main-color);
}

.setting-card-token-item-content-percent {
    font-size: 14px;
}

.setting-card-item-name {
    flex: 1;
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