<template>
    <div class="setting">
        <a class="setting-button-item setting-button-item-logout" @click="logoutClick">退出登录</a>
    </div>
</template>

<script setup lang="ts" name="setting">
import { useConfirm } from '@/composables';
import { useUserStore } from '@/stores';

// 确认弹窗
const confirm = useConfirm();
// 用户store
const userStore = useUserStore();

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
}

.setting-button-item {
    background-color: var(--ch-feature-card-bg);
    min-height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
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