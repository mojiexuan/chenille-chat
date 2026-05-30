<template>
    <div class="default-layout">
        <div class="default-layout-nav" :class="{ 'active': sidebarActive }">
            <section class="default-layout-nav-header">
                <!-- 开关侧边栏 -->
                <div class="default-layout-nav-header-button" @click="switchSidebarClick">
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="36" height="36" rx="3" fill="none" stroke="#1b1b1f" stroke-width="3"
                            stroke-linejoin="round" />
                        <path d="M16 6V42" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M13 42H19" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M13 6H19" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <!-- 新会话 -->
                <div class="default-layout-nav-header-button">
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H44V36H29L24 41L19 36H4V6Z" fill="none" stroke="#1b1b1f" stroke-width="3"
                            stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M23 21H25.0025" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round" />
                        <path d="M33.001 21H34.9999" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round" />
                        <path d="M13.001 21H14.9999" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round" />
                    </svg>
                </div>
            </section>
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
            <div class="default-layout-content-header">
                <!-- 开关侧边栏 -->
                <div class="default-layout-content-header-button" :class="{ 'active': !sidebarActive }"
                    @click="switchSidebarClick">
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="36" height="36" rx="3" fill="none" stroke="#1b1b1f" stroke-width="3"
                            stroke-linejoin="round" />
                        <path d="M16 6V42" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M13 42H19" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M13 6H19" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
            <main class="default-layout-content-main">
                <div class="default-layout-content-main-container">
                    <router-view></router-view>
                </div>
            </main>
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
// 侧边栏是否显示
const sidebarActive = ref(true);

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

/**
 * 点击开关侧边栏
 */
function switchSidebarClick() {
    sidebarActive.value = !sidebarActive.value;
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
    padding: 0 6px;
    overflow: hidden;
    position: fixed;
    transform: translateX(-100%);
    transition: all .3s ease;
}

@media screen and (min-width: 768px) {
    .default-layout-nav.active {
        position: unset;
        transform: translateX(0);
    }
}

.default-layout-nav-header {
    width: 242px;
    height: var(--ch-height-header);
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
}

.default-layout-nav-header-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    cursor: w-resize;
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

.default-layout-content-header {
    width: 100%;
    height: var(--ch-height-header);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
}

.default-layout-content-header-button {
    display: none;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    cursor: w-resize;
}

.default-layout-content-header-button.active {
    display: flex;
}

.default-layout-content-main {
    width: 100%;
    height: calc(100vh - var(--ch-height-header) - 12px);
    overflow: hidden;
}

.default-layout-content-main-container {
    width: 100%;
    max-width: 960px;
    height: calc(100vh - var(--ch-height-header) - 12px);
    padding: 0 20px;
    overflow-y: auto;
    overflow-x: hidden;
    margin: 0 auto;
    transition: all .3s ease;
}
</style>