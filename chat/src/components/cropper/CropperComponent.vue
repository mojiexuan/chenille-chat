<template>
    <div class="cropper">
        <div class="cropper-content">
            <div class="cropper-content-header">
                <button class="cropper-content-header-close" @click.stop="handleCloseClick">
                    <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8L40 40" stroke="#1b1b1f" stroke-width="4" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M8 40L40 8" stroke="#1b1b1f" stroke-width="4" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
            <div class="cropper-content-body">
                <div class="cropper-content-body-crop-box">
                    <VueCropper ref="cropperRef" :img="imageUrl" :outputSize="1" outputType="png" :fixed="true"
                        :canScale="false" :autoCrop="true" :canMove="false" :centerBox="true" limitMinSize="88"
                        autoCropWidth="200" autoCropHeight="200" @realTime="handleRealTimePreview">
                    </VueCropper>
                </div>
                <div class="cropper-content-body-preview-container">
                    <div class="cropper-content-body-preview-container-box" :style="previewStyle">
                        <div :style="previewData?.div">
                            <img :src="previewData?.url" alt="裁剪预览" :style="previewData?.img" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="cropper-footer">
                <button class="cropper-footer-confirm" @click.stop="handleConfirmClick">确认</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="Cropper">
import 'vue-cropper/dist/index.css'
import { VueCropper } from "vue-cropper";
import type { VueCropperInstance } from "vue-cropper";
import { ref, computed } from "vue";

// 预览数据
interface PreviewData {
    url: string,
    div: {
        width: string;
        height: string;
    },
    img: {
        width: string;
        height: string;
        transform: string;
    },
    w: number,
    h: number
}

// 定义 props
const props = defineProps<{
    file: File;
}>();

// 计算图片url
const imageUrl = computed(() => URL.createObjectURL(props.file));

// 定义事件
const emit = defineEmits<{
    close: [];
    confirm: [blob: Blob];
}>();

// 预览图片html
const previewData = ref<PreviewData | null>(null);
const previewStyle = ref({
    width: "200px",
    height: "200px",
    overflow: "hidden",
    margin: "0",
    zoom: 1
});

// 裁剪器实例
const cropperRef = ref<VueCropperInstance | null>(null);

/**
 * 关闭裁剪器
 */
function handleCloseClick() {
    emit("close");
}

/**
 * 确认裁剪
 */
function handleConfirmClick() {
    if (cropperRef.value) {
        cropperRef.value.getCropBlob((blob: Blob) => {
            emit("confirm", blob);
        })
    }
}

/**
 * 实时预览
 */
function handleRealTimePreview(data: PreviewData) {
    previewData.value = data;
    previewStyle.value.width = data.w + "px";
    previewStyle.value.height = data.h + "px";
    previewStyle.value.zoom = 88 / data.w;
}
</script>

<style scoped>
.cropper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 95;
    background: var(--ch-mask-active);
    padding: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.cropper-content {
    background: var(--ch-bg-color-card);
    padding: 0 0 16px 16px;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.cropper-content-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.cropper-content-header-close {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.cropper-content-body {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 16px 0 0;
}

.cropper-content-body-crop-box {
    width: 300px;
    height: 300px;
}

.cropper-content-body-preview-container {
    width: 200px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.cropper-content-body-preview-container-box {
    border-radius: 50%;
    overflow: hidden;
}

.cropper-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 16px 0 0;
}

.cropper-footer-confirm {
    width: 120px;
    height: 48px;
    padding: 8px 13px;
    border-radius: 8px;
    font-size: 16px;
    background-color: var(--ch-main-color);
    border: 1px solid var(--ch-main-color);
    color: var(--ch-text-white-color);
    user-select: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
}

.cropper-footer-confirm:hover {
    background-color: var(--ch-main-hover-color);
}
</style>