<template>
    <div v-if="sessionStore.attachments.length > 0" class="home-attachment-area">
        <div :class="['home-attachment-area-item', attachment.status === 'uploaded' ? 'home-attachment-area-item-loaded' : '']"
            v-for="attachment in sessionStore.attachments" :key="attachment.id">
            <img v-if="attachment.fileType === 'image'" class="home-attachment-area-item-image"
                :src="attachment.fileUrl" :alt="attachment.fileName" draggable="false">
            <!-- 上传动画 -->
            <div v-if="attachment.status === 'uploading'" class="home-attachment-area-item-uploading">
                <div class="home-attachment-area-item-uploading-loading"></div>
            </div>
            <!-- 失败 -->
            <div v-if="attachment.status === 'failed'" class="home-attachment-area-item-failed" @click="deleteAttachmentClick(attachment)">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 10V44H39V10H9Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/><path d="M20 20V33" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 20V33" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 10H44" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 10L19.289 4H28.7771L32 10H16Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/></svg>
            </div>
            <!-- 预览 -->
            <div class="home-attachment-area-item-preview" @click="previewPictureClick(attachment)">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M24 36C35.0457 36 44 24 44 24C44 24 35.0457 12 24 12C12.9543 12 4 24 4 24C4 24 12.9543 36 24 36Z"
                        fill="none" stroke="#1b1b1f" stroke-width="3" stroke-linejoin="round" />
                    <path
                        d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z"
                        fill="none" stroke="#1b1b1f" stroke-width="3" stroke-linejoin="round" />
                </svg>
            </div>
            <!-- 删除 -->
            <div class="home-attachment-area-item-delete" @click="deleteAttachmentClick(attachment)">
                <svg width="10" height="10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 14L34 34" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M14 34L34 14" stroke="#1b1b1f" stroke-width="3" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="AttachmentArea">
import { useSessionStore } from "@/stores";
import { usePreviewPicture } from "@/composables";
import type { ChatAttachmentUploadInfo } from "@/types";

const sessionStore = useSessionStore();
const previewPicture = usePreviewPicture();

/**
 * 预览图片
 */
function previewPictureClick(attachment: ChatAttachmentUploadInfo) {
    previewPicture.show(attachment.fileUrl);
}

/**
 * 删除附件
 */
function deleteAttachmentClick(attachment: ChatAttachmentUploadInfo) {
    sessionStore.removeAttachment(attachment.id);
}
</script>

<style scoped>
.home-attachment-area {
    width: 100%;
    overflow-y: hidden;
    overflow-x: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    box-sizing: border-box;
}

.home-attachment-area-item {
    position: relative;
    width: 52px;
    max-width: 52px;
    min-width: 52px;
    height: 52px;
    max-height: 52px;
    min-height: 52px;
    border-radius: 10px;
}

.home-attachment-area-item-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
    border-radius: 10px;
}

.home-attachment-area-item:hover .home-attachment-area-item-delete {
    display: flex;
}

.home-attachment-area-item-uploading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: color-mix(in srgb,
            var(--ch-feature-card-hover-bg) 80%,
            transparent);
    border-radius: 10px;
}

/* 加载动画 */
.home-attachment-area-item-uploading-loading  {
     width: 20px;
     height: 20px;
     border: 2px solid #000;
     border-top-color: transparent;
     border-radius: 100%;
     animation: home-attachment-area-item-uploading-loading infinite 0.75s linear;
}
@keyframes home-attachment-area-item-uploading-loading  {
     0%  {
     transform: rotate(0);
}
 100%  {
     transform: rotate(360deg);
}
}

.home-attachment-area-item-failed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: color-mix(in srgb,
            var(--ch-tip-error-color) 40%,
            transparent);
    border-radius: 10px;
}

.home-attachment-area-item-preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: color-mix(in srgb,
            var(--ch-feature-card-hover-bg) 80%,
            transparent);
}

.home-attachment-area-item-delete {
    width: 14px;
    height: 14px;
    position: absolute;
    top: -4px;
    right: -4px;
    background: color-mix(in srgb, var(--ch-black-color) 80%, transparent);
    border-radius: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.home-attachment-area-item-delete svg path {
    stroke: var(--ch-white-color);
}

.home-attachment-area-item-loaded:hover .home-attachment-area-item-preview {
    display: flex;
}
</style>