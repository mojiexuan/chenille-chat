<template>
  <!-- 工作区操作 -->
  <div v-if="isSupportDirectoryPicker" class="home-input-area-box-work">
    <div class="home-input-area-box-work-left">
      <div class="home-input-area-box-work-left-item" @click="selectDirectoryClick">
        <!-- 选择文件夹图标 -->
        <svg v-if="sessionStore.isCurrentSessionWorkSpaceStatus === 'none'" width="18" height="18" viewBox="0 0 48 48"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5 8C5 6.89543 5.89543 6 7 6H19L24 12H41C42.1046 12 43 12.8954 43 14V40C43 41.1046 42.1046 42 41 42H7C5.89543 42 5 41.1046 5 40V8Z"
            fill="none" stroke="#3c3c43" stroke-width="4" stroke-linejoin="round" />
          <path d="M18 27H30" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
          <path d="M24 21L24 33" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
        </svg>
        <!-- 文件夹异常 -->
        <svg v-if="sessionStore.isCurrentSessionWorkSpaceStatus === 'error'" width="20" height="20" viewBox="0 0 48 48"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M43 23V14C43 12.8954 42.1046 12 41 12H24L19 6H7C5.89543 6 5 6.89543 5 8V40C5 41.1046 5.89543 42 7 42H22"
            stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M30 30L40 40" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M40 30L30 40" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <!-- 文件夹准备好 -->
        <svg v-if="sessionStore.isCurrentSessionWorkSpaceStatus === 'ready'" width="18" height="18" viewBox="0 0 48 48"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M43 23V14C43 12.8954 42.1046 12 41 12H24L19 6H7C5.89543 6 5 6.89543 5 8V40C5 41.1046 5.89543 42 7 42H22"
            stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M29 38L34 42L43 31" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        <span>{{ sessionStore.currentSessionWorkSpace?.name || "选择文件夹" }}</span>
      </div>
    </div>
    <div class="home-input-area-box-work-right"></div>
  </div>
</template>

<script setup lang="ts" name="Workspace">
import { ref } from "vue";
import { pickDirectory } from "@/utils";
import { useSessionStore } from "@/stores";

const sessionStore = useSessionStore();

// 是否支持文件夹选择
// const isSupportDirectoryPicker = ref(window.showDirectoryPicker !== void 0);
// !TODO: 临时关闭文件夹选择功能
const isSupportDirectoryPicker = ref(false);

/**
 * 选择目录
 */
function selectDirectoryClick() {
  pickDirectory()
    .then((handle) => {
      if (handle) {
        sessionStore.setCurrentSessionWorkSpace(handle);
      }
    })
}
</script>

<style scoped>
.home-input-area-box-work {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
}

.home-input-area-box-work-left {
  display: flex;
  align-items: center;
}

.home-input-area-box-work-left-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  border-radius: 8px;
  padding: 4px 8px;
  user-select: none;
  cursor: pointer;
}

.home-input-area-box-work-left-item:hover {
  background: var(--ch-feature-card-hover-bg);
}
</style>
