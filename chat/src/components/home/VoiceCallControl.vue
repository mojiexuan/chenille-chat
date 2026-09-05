<template>
    <div @click="openVoiceCallClick">
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 3.99976V43.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
            <path d="M34 11.9998V35.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
            <path d="M4 17.9998V29.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
            <path d="M44 17.9998V29.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
            <path d="M14 11.9998V35.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
        </svg>
    </div>
    <!-- AI语音通话 -->
    <VoiceCall :show="showVoiceCall" @update:show="closeVoiceCallClick" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import VoiceCall from "./VoiceCall.vue";

// 是否显示语音通话
const showVoiceCall = ref(false);

/**
 * 打开语音通话页面
 */
function openVoiceCallClick() {
  showVoiceCall.value = true;
}

/**
 * 关闭语音通话页面
 */
function closeVoiceCallClick() {
  showVoiceCall.value = false;
}
</script>

<style scoped>
</style>
