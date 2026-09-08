<template>
  <div class="model-select" @click="openModelSelectMenuClick">
    <span>{{ modelStore.currentModel?.name || "Auto" }}</span>
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M36 18L24 30L12 18" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <!-- 模型选择菜单 -->
    <ContextMenu :visible="modelSelectMenuVisible" :anchor="modelSelectMenuAnchor"
      @close="modelSelectMenuVisible = false">
      <div class="home-model-select-menu">
        <div class="home-model-select-menu-item" v-for="item in modelStore.models" :key="item.id"
          @click="switchModelClick(item.id)">
          <div class="home-model-select-menu-item-content">
            <span>{{ item.name }}</span>
          </div>
          <div class="home-model-select-menu-item-default">
            <svg v-if="item.isDefault" width="20" height="20" viewBox="0 0 48 48" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M10 24L20 34L40 14" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </ContextMenu>
  </div>
</template>

<script setup lang="ts" name="ModelSelect">
import { ref } from "vue";
import { useModelStore } from "@/stores";

import ContextMenu from '@/components/menu/ContextMenu.vue';

// 模型store
const modelStore = useModelStore();

// 是否显示模型选择菜单
const modelSelectMenuVisible = ref(false);
// 模型选择菜单锚点
const modelSelectMenuAnchor = ref({ x: 0, y: 0 });

/**
 * 打开模型选择菜单
 */
function openModelSelectMenuClick(e: MouseEvent) {
  modelSelectMenuAnchor.value = { x: e.clientX, y: e.clientY };
  modelSelectMenuVisible.value = !modelSelectMenuVisible.value;
}

/**
 * 切换模型
 */
function switchModelClick(modelId: string) {
  modelStore.switchModel(modelId);
}
</script>

<style scoped>
.model-select {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 6px;
}

.home-model-select-menu {
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

.home-model-select-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 8px;
  user-select: none;
  cursor: pointer;
}

.home-model-select-menu-item:hover {
  background-color: var(--ch-feature-card-bg);
}

.home-model-select-menu-item-content {
  flex: 1 1;
}

.home-model-select-menu-item-default {
  width: 20px;
  height: 20px;
}
</style>
