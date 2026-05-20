<template>
    <div class="blank-layout">
        <router-view />
    </div>
</template>

<script setup lang="ts">
// 空白布局，用于登录页等不需要导航栏的页面
</script>

<style scoped>
.blank-layout {
    width: 100vw;
    height: 100vh;
    background: var(--ch-feature-card-bg);
}
</style>