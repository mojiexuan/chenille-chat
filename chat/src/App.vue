<script setup lang="ts">
import AuthModal from '@/components/modal/AuthModal.vue'
import ToastMessage from '@/components/toast/ToastMessage.vue';
import ConfirmDialog from '@/components/dialog/ConfirmDialog.vue';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores';
import { initCaptcha } from '@/utils';

// 用户store
const userStore = useUserStore();

onMounted(() => {
  // 初始化验证码
  initCaptcha();
  // 初始化用户信息
  if (userStore.isLogin) {
    userStore.refreshUserInfo();
  }
})
</script>

<template>
  <div class="app">
    <router-view></router-view>
    <AuthModal />
    <ToastMessage />
    <ConfirmDialog />
  </div>
</template>

<style scoped></style>
