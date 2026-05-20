<script setup lang="ts">
import AuthModal from '@/components/modal/AuthModal.vue'
import ToastMessage from './components/toast/ToastMessage.vue';
</script>

<template>
  <div class="app">
    <router-view></router-view>
    <AuthModal />
    <ToastMessage />
  </div>
</template>

<style scoped></style>
