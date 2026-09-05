<template>
    <Teleport to="body">
        <Transition name="preview-picture">
            <div v-if="previewPictureState.visible" class="preview-picture" @wheel.prevent="handleWheel">
                <!-- 工具栏 -->
                <div class="preview-picture-tool">
                    <div class="preview-picture-tool-left">
                        <!-- 放大 -->
                         <div :class="['preview-picture-tool-left-item', {'preview-picture-tool-left-item-disabled': scale >= MAX_SCALE}]" @click="zoomIn" title="放大">
                            <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/><path d="M21 15L21 27" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.0156 21.0156L27 21" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M33.2216 33.2217L41.7069 41.707" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                         </div>
                        <!-- 缩小 -->
                         <div :class="['preview-picture-tool-left-item', {'preview-picture-tool-left-item-disabled': scale <= MIN_SCALE}]" @click="zoomOut" title="缩小">
                            <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/><path d="M15 21L27 21" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M33.2216 33.2217L41.7069 41.707" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                         </div>
                    </div>
                    <div class="preview-picture-tool-right">
                        <div class="preview-picture-tool-right-close" @click="close" title="关闭图片预览">
                            <svg width="16" height="16" viewBox="0 0 48 48" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 14L34 34" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path d="M14 34L34 14" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
                <!-- 图片预览 -->
                <img :class="{ 'is-dragging': dragging }" :src="srcUrl" alt="图片预览" @error="handleError"
                    draggable="false" @mousedown="handleMouseDown" :style="{
                        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
                    }" />
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts" name="PreviewPicture">
import { computed, ref, watch } from 'vue';

import { previewPictureState } from '@/composables';

// 缩放比例
const scale = ref(1);

// 图片平移距离
const translateX = ref(0);
const translateY = ref(0);

// 是否片正在拖动
const dragging = ref(false);

// 开始拖动时的坐标
let startX = 0;
let startY = 0;
// 开始拖动时的平移距离
let startTranslateX = 0;
let startTranslateY = 0;

// 缩放比例范围
const MIN_SCALE = 0.2;
const MAX_SCALE = 5;
// 缩放比例步长
const SCALE_STEP = 0.1;

/**
 * 预览图片的URL
 */
const srcUrl = computed(() => {
    if (typeof previewPictureState.src === 'string') {
        return previewPictureState.src;
    } else {
        return URL.createObjectURL(previewPictureState.src);
    }
});

/**
 * 放大
 */
function zoomIn() {
    scale.value = Math.min(
        MAX_SCALE,
        scale.value + SCALE_STEP * 2
    );
}

/**
 * 鼠标滚轮缩放
 */
function handleWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
        scale.value = Math.min(
            MAX_SCALE,
            scale.value + SCALE_STEP
        );
    } else {
        scale.value = Math.max(
            MIN_SCALE,
            scale.value - SCALE_STEP
        );
    }

    // 恢复到原始大小或更小时，顺便回到中心
    if (scale.value <= 1) {
        translateX.value = 0;
        translateY.value = 0;
    }
}

/**
 * 缩小
 */
function zoomOut() {
    scale.value = Math.max(
        MIN_SCALE,
        scale.value - SCALE_STEP * 2
    );
    // 恢复到原始大小或更小时，顺便回到中心
    if (scale.value <= 1) {
        translateX.value = 0;
        translateY.value = 0;
    }
}



/**
 * 开始拖动
 */
function handleMouseDown(event: MouseEvent) {
    // 缩放比例小于等于1时，不支持拖动
    if (scale.value <= 1) {
        return;
    }

    // 开始拖动
    dragging.value = true;

    // 记录开始拖动时的坐标
    startX = event.clientX;
    startY = event.clientY;

    // 记录开始拖动时的平移距离
    startTranslateX = translateX.value;
    startTranslateY = translateY.value;

    // 监听鼠标移动事件
    window.addEventListener('mousemove', handleMouseMove);
    // 监听鼠标松开事件
    window.addEventListener('mouseup', handleMouseUp);
}

/**
 * 拖动中
 */
function handleMouseMove(event: MouseEvent) {
    // 棖动中，不处理其他事件
    if (!dragging.value) {
        return;
    }

    // 计算当前平移距离
    translateX.value =
        startTranslateX + event.clientX - startX;
    translateY.value =
        startTranslateY + event.clientY - startY;
}

/**
 * 结束拖动
 */
function handleMouseUp() {
    // 结束拖动
    dragging.value = false;

    // 移除鼠标移动事件监听
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
}

/**
 * 图片加载失败处理
 */
function handleError() {
    console.error('图片加载失败:', srcUrl.value);
}

/**
 * 关闭预览
 */
function close() {
    previewPictureState.visible = false;
}

/**
 * 每次重新打开时恢复原始缩放
 */
watch(
    () => previewPictureState.visible,
    (visible) => {
        if (visible) {
            scale.value = 1;
            translateX.value = 0;
            translateY.value = 0;
        }
    }
);
</script>

<style scoped>
.preview-picture {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: var(--ch-mask-active);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 105;
}

.preview-picture img {
    max-width: 100vw;
    max-height: 100vh;
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
    cursor: grab;
    transform-origin: center center;
    transition: transform 0.08s ease;
}

.preview-picture img.is-dragging {
    cursor: grabbing;
    transition: none;
}

.preview-picture-tool {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    box-sizing: border-box;
    background: color-mix(in srgb,
            var(--ch-black-color) 80%,
            transparent);
    z-index: 1;
}

.preview-picture-tool-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.preview-picture-tool-left-item {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.preview-picture-tool-left-item-disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.preview-picture-tool-left-item-disabled svg path {
    stroke: var(--ch-white-color);
}

.preview-picture-tool-right-close {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.preview-picture-tool-right-close svg path {
    stroke: var(--ch-white-color);
}
</style>