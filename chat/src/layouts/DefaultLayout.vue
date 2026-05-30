<template>
    <div class="default-layout">
        <div class="default-layout-nav">
            <section class="default-layout-nav-header"></section>
            <section class="default-layout-nav-content"></section>
            <section class="default-layout-nav-footer">
                <div class="default-layout-nav-footer-me">
                    <img class="default-layout-nav-footer-me-avatar" :src="userAvatar" alt="用户头像" />
                    <span class="default-layout-nav-footer-me-name ellipsis">{{ userNameNickname }}</span>
                </div>
            </section>
        </div>
        <div class="default-layout-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup lang="ts" name="home">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user';

// 用户store
const userStore = useUserStore();

// 用户头像
const userAvatar = computed(() => userStore.user.avatar);
const userNameNickname = computed(() => userStore.user.nickname);
</script>

<style scoped>
.default-layout {
    width: 100vw;
    height: 100vh;
    background: var(--ch-feature-card-bg);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 6px;
    overflow: hidden;
}

.default-layout-nav {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 254px;
    height: calc(100vh - 12px);
    padding: 6px;
    overflow: hidden;
    position: fixed;
    transform: translateX(-100%);
    transition: all .3s ease;
}

@media screen and (min-width: 768px) {
    .default-layout-nav {
        position: unset;
        transform: translateX(0);
    }
}

.default-layout-nav-content {
    flex: 1;
}

.default-layout-nav-footer-me {
    width: 242px;
    padding: 6px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    border-radius: 8px;
}

.default-layout-nav-footer-me:hover {
    background: var(--ch-feature-card-hover-bg);
}

.default-layout-nav-footer-me-avatar {
    width: 32px;
    max-width: 32px;
    min-width: 32px;
    height: 32px;
    max-height: 32px;
    min-height: 32px;
    border-radius: 50%;
}

.default-layout-nav-footer-me-name {
    flex: 1;
    user-select: none;
    font-size: 14px;
    font-weight: 500;
    color: var(--ch-text-color-1);
}

.default-layout-content {
    flex: 1;
    height: 100%;
    background: var(--ch-bg-color-card);
    border-radius: 8px;
    overflow: hidden;
    transition: all .3s ease;
}
</style>