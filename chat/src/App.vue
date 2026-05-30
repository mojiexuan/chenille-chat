<script setup lang="ts">
import AuthModal from '@/components/modal/AuthModal.vue'
import ToastMessage from './components/toast/ToastMessage.vue';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores';

// 用户store
const userStore = useUserStore();

onMounted(() => {
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
  </div>
</template>

<style scoped></style>
