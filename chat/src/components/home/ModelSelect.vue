<template>
  <div class="model-select" @click="openModelSelectMenuClick" v-click-outside="closeModelSelectMenu">
    <span>{{ modelStore.currentModel?.name || "Auto" }}</span>
    <svg class="model-select-arrow" :class="{ 'model-select-arrow-open': modelSelectMenuVisible }" width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M36 18L24 30L12 18" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <!-- 模型选择菜单 -->
    <div v-if="modelSelectMenuVisible" class="model-select-container" :style="{ right: `${modelSelectMenuAnchor.right}px`, top: `${modelSelectMenuAnchor.top}px` }">
      <div class="model-select-menu">
        <div class="model-select-menu-item" v-for="item in modelStore.models" :key="item.id"
          @click="switchModelClick(item.id)">
          <div class="model-select-menu-item-content">
            <span>{{ item.name }}</span>
          </div>
          <div class="model-select-menu-item-default">
            <svg v-if="item.isDefault" width="20" height="20" viewBox="0 0 48 48" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M10 24L20 34L40 14" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="ModelSelect">
import { onMounted, ref, onBeforeUnmount } from "vue";
import { useModelStore } from "@/stores";

// 模型store
const modelStore = useModelStore();

// 是否显示模型选择菜单
const modelSelectMenuVisible = ref(false);
// 模型选择菜单锚点
const modelSelectMenuAnchor = ref({ right: 0, top: 0 });
// 触发按钮元素
let triggerEl: HTMLElement | null = null;

/**
 * 同步模型选择菜单位置
 */
function syncMenuPosition() {
  if (!triggerEl) {
    return;
  }
  const rect = triggerEl.getBoundingClientRect();
  modelSelectMenuAnchor.value = { right: window.innerWidth - rect.right, top: rect.top };
}

/**
 * 打开模型选择菜单
 */
function openModelSelectMenuClick(e: MouseEvent) {
  triggerEl = e.currentTarget as HTMLElement;
  if (!modelSelectMenuVisible.value) {
    syncMenuPosition();
  }
  modelSelectMenuVisible.value = !modelSelectMenuVisible.value;
}

/**
 * 关闭模型选择菜单
 */
function closeModelSelectMenu() {
  modelSelectMenuVisible.value = false;
}

/**
 * 切换模型
 */
function switchModelClick(modelId: string) {
  modelStore.switchModel(modelId);
}

onMounted(() => {
  window.addEventListener("resize", syncMenuPosition);
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncMenuPosition);
})
</script>

<style scoped>
.model-select {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 6px;
  max-width: 160px;
}

.model-select > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-select-arrow {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.model-select-arrow-open {
  transform: rotate(180deg);
}

.model-select-container {
  position: fixed;
  transform: translateY(calc(-100% - 8px));
  z-index: 100;
}

.model-select-menu {
  min-width: 160px;
  max-width: 236px;
  max-height: 520px;
  background-color: var(--ch-bg-color-card);
  border-radius: 10px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, .06);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  overflow-x: hidden;
}

.model-select-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 8px;
  user-select: none;
  cursor: pointer;
}

.model-select-menu-item:hover {
  background-color: var(--ch-feature-card-bg);
}

.model-select-menu-item-content {
  flex: 1 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-select-menu-item-default {
  width: 20px;
  height: 20px;
}

.model-select-menu-item-default svg {
  flex-shrink: 0;
}
</style>
