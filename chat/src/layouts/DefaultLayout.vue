<template>
    <div class="default-layout">
        <div class="default-layout-nav">
            <section class="default-layout-nav-header"></section>
            <section class="default-layout-nav-content"></section>
            <section class="default-layout-nav-footer">
                <div class="default-layout-nav-footer-me" :class="{ 'active': footerMeActive }" @click="footerMeClick">
                    <!-- 悬浮卡片 -->
                    <menu class="default-layout-nav-footer-me-content">
                        <div class="default-layout-nav-footer-me-content-item">
                            <div class="default-layout-nav-footer-me-content-item-icon">
                                <svg width="20" height="20" viewBox="0 0 48 48" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M34.0003 41L44 24L34.0003 7H14.0002L4 24L14.0002 41H34.0003Z" fill="none"
                                        stroke="#1b1b1f" stroke-width="3" stroke-linejoin="round" />
                                    <path
                                        d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z"
                                        fill="none" stroke="#1b1b1f" stroke-width="3" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <span class="default-layout-nav-footer-me-content-item-name ellipsis">设置</span>
                        </div>
                        <span class="default-layout-nav-footer-me-content-line"></span>
                        <div class="default-layout-nav-footer-me-content-item">
                            <img class="default-layout-nav-footer-me-content-item-icon" :src="userAvatar" alt="用户头像" />
                            <span class="default-layout-nav-footer-me-content-item-name ellipsis">{{ userNameNickname
                                }}</span>
                        </div>
                    </menu>
                    <!-- 用户信息 -->
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
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user';

// 用户store
const userStore = useUserStore();

// 用户头像
const userAvatar = computed(() => userStore.user.avatar);
const userNameNickname = computed(() => userStore.user.nickname);

// 悬浮卡片是否显示
const footerMeActive = ref(false);

/**
 * 点击用户信息
 */
function footerMeClick() {
    if (userStore.isLogin) {
        footerMeActive.value = !footerMeActive.value;
    } else {
        footerMeActive.value = false;
        userStore.logout();
    }
}
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
    position: relative;
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

.default-layout-nav-footer-me.active .default-layout-nav-footer-me-content {
    display: block;
}

.default-layout-nav-footer-me-content {
    position: absolute;
    bottom: 120%;
    left: 0;
    width: 242px;
    background-color: var(--ch-bg-color-card);
    border-radius: 8px;
    padding: 6px;
    display: none;
    box-shadow: var(--ch-box-shadow-1);
}

.default-layout-nav-footer-me-content-item {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 6px;
    gap: 8px;
    cursor: pointer;
    border-radius: 8px;
}

.default-layout-nav-footer-me-content-item:hover {
    background: var(--ch-feature-card-hover-bg);
}

.default-layout-nav-footer-me-content-line {
    display: flex;
    width: 100%;
    height: 1px;
    background-color: var(--ch-border-card-color);
    margin: 6px 0;
}

.default-layout-nav-footer-me-content-item-icon {
    width: 24px;
    max-width: 24px;
    min-width: 24px;
    height: 24px;
    max-height: 24px;
    min-height: 24px;
    border-radius: 50%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.default-layout-nav-footer-me-content-item-name {
    flex: 1;
    user-select: none;
    font-size: 12px;
    font-weight: 500;
    color: var(--ch-text-color-1);
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