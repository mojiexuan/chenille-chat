<template>
  <div class="home">
    <div class="home-container" :class="{ 'home-container-empty': sessionStore.currentSession.messages.length === 0 }">
      <!-- 消息列表 -->
      <MessageItem @regenerate="(e) => sendClick(e, true)" />
      <!-- 等待动画 -->
      <div v-if="sessionStore.isReplying" class="home-container-replying">
        <img class="home-container-replying-image" src="../assets/images/replying.svg" alt="思考中" />
        <RotatingText :texts="sessionStore.gerundIndicator" animate-presence-mode="wait" :rotation-interval="3000"
          :stagger-duration="0.025" />
      </div>
      <!-- 错误提示 -->
      <div class="home-container-error"></div>
      <!-- 打招呼 -->
      <div class="home-container-hi" v-if="sessionStore.currentSession.messages.length === 0">
        <span class="home-container-hi-say">你好，{{ userStore.user.nickname || "你在忙什么？" }}</span>
      </div>
    </div>
    <!-- 输入区域 -->
    <InputArea />
  </div>
</template>

<script setup lang="ts" name="home">
import { nextTick, inject } from "vue";
import { useSessionStore, useUserStore, useModelStore } from "@/stores";
import MessageItem from "@/components/home/MessageItem.vue";
import RotatingText from "@/component/RotatingText/RotatingText.vue";
import InputArea from "@/components/home/InputArea.vue";

// 会话store
const sessionStore = useSessionStore();
// 用户store
const userStore = useUserStore();
// 模型store
const modelStore = useModelStore();
// 滚动到内容区域底部的方法
const scrollMainToBottom = inject<(force?: boolean) => void>("scrollMainToBottom", () => { });

/**
 * 发送按钮点击事件处理
 */
function sendClick(_event?: MouseEvent, regenerate = false) {
  sessionStore.sendMessage({
    currentModelId: modelStore.currentModel?.id || void 0,
    regenerate,
    onUpdateUi: async () => {
      nextTick(() => scrollMainToBottom());
    },
  });
}
</script>

<style scoped>
.home {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.home-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px;
}

.home-container-empty {
  align-items: center;
  justify-content: center;
}

.home-container-hi {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home-container-hi-say {
  font-size: 28px;
  font-weight: 500;
  line-height: 1.3;
  user-select: none;
}
</style>
