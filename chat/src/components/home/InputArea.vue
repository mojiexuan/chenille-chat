<template>
    <div class="home-input-area">
        <div class="home-input-area-box">
            <!-- 附件区域 -->
            <AttachmentArea />
            <!-- 编辑区 -->
            <div class="home-input-area-box-editor">
                <div class="home-input-area-box-editor-wrapper" :class="{ 'speech-active': showSpeechRecognition }"
                    :data-message="sessionStore.editorMessage">
                    <SpeechWaveform v-if="showSpeechRecognition" :volume="microphoneVolume" :height="44" />
                    <textarea v-else class="home-input-area-box-editor-wrapper-textarea"
                        v-model="sessionStore.editorMessage" placeholder="聊点什么？shift+enter换行" spellcheck="false"
                        autocomplete="off" autocapitalize="off" enterkeyhint="send" @keydown="handleEditorKeydown"
                        @paste="handleEditorPaste"></textarea>
                </div>
                <!-- 功能区域 -->
                <div class="home-input-area-box-editor-end">
                    <div class="home-input-area-box-editor-end-track"
                        :style="{ transform: `translateY(-${activeToolbarPanel * 34}px)` }">
                        <!-- 上 -->
                        <div class="home-input-area-box-editor-end-track-top"></div>
                        <!-- 中 -->
                        <div class="home-input-area-box-editor-end-track-middle">
                            <!-- 左侧 -->
                            <div class="home-input-area-box-editor-end-track-middle-left">
                                <!-- 附件选择 -->
                                <!-- <AttachmentControl class="home-input-area-box-editor-end-track-middle-left-button"/> -->
                                <!-- 图片上传 -->
                                <PictureControl class="home-input-area-box-editor-end-track-middle-left-button" />
                                <!-- 打开语音通话页面 -->
                                <!-- <VoiceCallControl class="home-input-area-box-editor-end-track-middle-left-button"/> -->
                            </div>
                            <!-- 右侧 -->
                            <div class="home-input-area-box-editor-end-track-middle-right">
                                <!-- 模型选择 -->
                                <ModelSelect class="home-input-area-box-editor-end-track-middle-right-model-select" />
                                <!-- 语音识别按钮 -->
                                <div class="home-input-area-box-editor-end-track-middle-right-button"
                                    @click="toggleSpeechRecognitionClick">
                                    <img v-if="speechRecognitionLoading" width="20" height="20"
                                        src="../assets/images/loading.svg" alt="语音识别中">
                                    <svg v-else width="20" height="20" viewBox="0 0 48 48" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <rect x="17" y="4" width="14" height="27" rx="7" fill="none" stroke="#3c3c43"
                                            stroke-width="4" stroke-linejoin="round" />
                                        <path d="M9 23C9 31.2843 15.7157 38 24 38C32.2843 38 39 31.2843 39 23"
                                            stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M24 38V44" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <!-- 发送暂停按钮 -->
                                <a class="home-input-area-box-editor-end-track-middle-right-button home-input-area-box-editor-end-track-middle-right-send-button"
                                    :class="{ active: sessionStore.canSend }" @click="sendClick">
                                    <svg v-if="sessionStore.isReplying" width="20" height="20" viewBox="0 0 48 48"
                                        fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M34 12H14C12.8954 12 12 12.8954 12 14V34C12 35.1046 12.8954 36 14 36H34C35.1046 36 36 35.1046 36 34V14C36 12.8954 35.1046 12 34 12Z"
                                            fill="#ffffff" stroke="#ffffff" stroke-width="4" />
                                    </svg>
                                    <svg v-else width="20" height="20" viewBox="0 0 48 48" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M24.0083 12.1006V36.0001" stroke="#ffffff" stroke-width="4"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M12 24L24 12L36 24" stroke="#ffffff" stroke-width="4"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <!-- 下 -->
                        <div class="home-input-area-box-editor-end-track-bottom">
                            <!-- 左侧 -->
                            <div class="home-input-area-box-editor-end-track-bottom-left"
                                @click="cancelSpeechRecognitionClick">
                                <svg width="20" height="20" viewBox="0 0 48 48" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 14L34 34" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                    <path d="M14 34L34 14" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            </div>
                            <!-- 中间 -->
                            <div class="home-input-area-box-editor-end-track-bottom-middle">
                                <span>{{ speechCountdown }}</span>s
                            </div>
                            <!-- 右侧 -->
                            <div class="home-input-area-box-editor-end-track-bottom-right"
                                @click="submitSpeechRecognitionClick">
                                <svg width="20" height="20" viewBox="0 0 48 48" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 24L20 34L40 14" stroke="#3c3c43" stroke-width="4"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 工作区操作 -->
            <Workspace />
        </div>
        <div class="home-input-area-tip">内容由AI生成，请仔细甄别</div>
    </div>
</template>

<script setup lang="ts" name="InputArea">
import { ref, watch, onUnmounted } from "vue";

import { asrRecognizeRequest } from "@/request";
import { useSessionStore, useModelStore } from "@/stores";
import { useMicrophoneVolume } from "@/composables";

import SpeechWaveform from "./SpeechWaveform.vue";
import Workspace from "./Workspace.vue";
import VoiceCallControl from "./VoiceCallControl.vue";
import AttachmentControl from "./AttachmentControl.vue";
import PictureControl from "./PictureControl.vue";
import ModelSelect from "./ModelSelect.vue";
import AttachmentArea from "./AttachmentArea.vue";
import { AI_CHAT_ACCEPTED_IMAGE_TYPES } from "@/constants";

const sessionStore = useSessionStore();
const modelStore = useModelStore();

// 是否显示语音识别
const showSpeechRecognition = ref(false);
// 是否正在识别语音
const speechRecognitionLoading = ref(false);
// 录音倒计时（秒）
const speechCountdown = ref(0);
const MAX_RECORD_SECONDS = 60;
// 倒计时定时器
let countdownTimer: ReturnType<typeof setInterval> | null = null;
// 工具栏当前面板 0=上 1=中(默认) 2=下
const activeToolbarPanel = ref<0 | 1 | 2>(1);
// 麦克风音量
const microphoneVolume = ref(0);
// 麦克风流
let audioStream: MediaStream | null = null;
// AudioContext，整个组件生命周期只创建一次
let audioContext: AudioContext | null = null;
// 停止音量采样的 setInterval
let stopVolumeTimer: (() => void) | null = null;
// 停止 volume → microphoneVolume 的响应式同步
let stopVolumeWatch: (() => void) | null = null;
// MediaRecorder 实例，收集录音数据
let mediaRecorder: MediaRecorder | null = null;
// 录音数据块缓存
const audioChunks: Blob[] = [];

/**
 * 发送消息
 */
function sendClick() {
    sessionStore.sendMessage({
        currentModelId: modelStore.currentModel?.id || void 0,
    });
}

/**
 * 编辑器键盘事件处理
 */
function handleEditorKeydown(e: KeyboardEvent) {
    if (e.shiftKey && e.key === "Enter") {
        return;
    }
    if (e.key === "Enter") {
        e.preventDefault();
        sendClick();
    }
}

/**
 * 取消语音识别
 */
function cancelSpeechRecognitionClick() {
    stopSpeechRecognition(false);
}

/**
 * 停止语音识别
 */
function stopSpeechRecognition(submit: boolean) {
    switchToolbarPanel(1);
    showSpeechRecognition.value = false;
    stopVolumeWatch?.();
    // 清除倒计时定时器
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    // 停止录音
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        if (!submit) {
            // 清除录音结束事件处理函数
            mediaRecorder.onstop = null;
        }
        mediaRecorder.stop();
    }
    audioStream?.getTracks().forEach((t) => t.stop());
    audioStream = null;
    microphoneVolume.value = 0;
}

/**
 * 切换语音识别开关
 */
async function toggleSpeechRecognitionClick() {
    if (speechRecognitionLoading.value) return;
    // 已开启 关闭麦克风
    if (showSpeechRecognition.value) {
        cancelSpeechRecognitionClick();
        return;
    }

    switchToolbarPanel(2);

    showSpeechRecognition.value = true;
    // 获取麦克风权限
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // AudioContext 首次创建，后续复用
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    // 创建音频分析节点
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;

    // 将麦克风流接入分析器
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    // 启动音量定时采样 + 响应式同步到 microphoneVolume
    const { volume, stop } = useMicrophoneVolume(analyser);

    stopVolumeTimer = stop;
    stopVolumeWatch = watch(volume, (v) => {
        microphoneVolume.value = v;
    });

    // 启动录音收集
    audioChunks.length = 0;
    // 录音倒计时
    speechCountdown.value = MAX_RECORD_SECONDS;
    countdownTimer = setInterval(() => {
        speechCountdown.value--;
        if (speechCountdown.value <= 0) {
            speechCountdown.value = 0;
            submitSpeechRecognitionClick();
        }
    }, 1000);
    // 启动录音
    mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm",
    });
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
        if (audioChunks.length === 0) return;
        const blob = new Blob(audioChunks, { type: mediaRecorder!.mimeType });
        speechRecognitionLoading.value = true;
        asrRecognizeRequest(blob, "recording.webm")
            .then((result) => {
                speechRecognitionLoading.value = false;
                sessionStore.editorMessage += result;
            })
            .catch(() => {
                speechRecognitionLoading.value = false;
            });
    };
    mediaRecorder.start();
}

/**
 * 提交语音识别
 */
function submitSpeechRecognitionClick() {
    stopSpeechRecognition(true);
}

/**
 * 切换工具栏面板
 * @param panel 0=上 1=中(默认) 2=下
 */
function switchToolbarPanel(panel: 0 | 1 | 2) {
    activeToolbarPanel.value = panel;
}

function handleEditorPaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) {
        return;
    }

    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;
        if (item.kind !== "file") continue;
        const file = item.getAsFile();
        if (!file) continue;
        if (!file.type.startsWith("image/") || !AI_CHAT_ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            continue;
        }
        imageFiles.push(file);
    }

    if (imageFiles.length <= 0) {
        return;
    }

    e.preventDefault();

    sessionStore.addAttachment(imageFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: "image",
        status: "uploading",
    })));
}

onUnmounted(() => {
    // 停止倒计时
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
    // 停止 volume 响应式同步
    stopVolumeWatch?.();
    // 停止音量采样 setInterval
    stopVolumeTimer?.();
    // 如果正在录音，停止录音
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
    // 释放麦克风硬件
    audioStream?.getTracks().forEach((t) => t.stop());
    // 释放 AudioContext
    audioContext?.close();
});
</script>

<style scoped>
.home-input-area {
    position: sticky;
    bottom: 0;
    width: 100%;
    padding: 0 20px 12px;
    background-color: var(--ch-bg-color-card);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.home-input-area-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: var(--ch-feature-card-bg);
    border-radius: 10px;
}

.home-input-area-box-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    background-color: var(--ch-bg-color-card);
    border-radius: 10px;
    border: 1px solid var(--ch-border-card-color);
    padding: 16px 16px 10px 16px;
    box-shadow: var(--ch-box-shadow-2);
}

.home-input-area-box-editor-wrapper {
    display: grid;
    max-height: 132px;
    overflow: hidden;
}

.home-input-area-box-editor-wrapper::after {
    content: attr(data-message) " ";
    white-space: pre-wrap;
    word-break: break-word;
    visibility: hidden;
    grid-area: 1 / 1;
    font: inherit;
}

.home-input-area-box-editor-wrapper.speech-active::after {
    display: none;
}

.home-input-area-box-editor-wrapper::after,
.home-input-area-box-editor-wrapper-textarea {
    font-size: 14px;
    line-height: 22px;
}

.home-input-area-box-editor-wrapper-textarea {
    grid-area: 1 / 1;
    width: 100%;
    max-height: 132px;
    resize: none;
    transition: all 0.2s linear;
    overflow-y: auto;
    overflow-x: hidden;
}

.home-input-area-box-editor-end {
    overflow: hidden;
    height: 34px;
}

.home-input-area-box-editor-end-track {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.home-input-area-box-editor-end-track-top {
    display: flex;
    align-items: center;
    height: 34px;
}

.home-input-area-box-editor-end-track-middle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 34px;
}

.home-input-area-box-editor-end-track-middle-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
}

.home-input-area-box-editor-end-track-middle-left-button {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.home-input-area-box-editor-end-track-middle-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
}

.home-input-area-box-editor-end-track-middle-right-model-select {
    height: 34px;
    padding: 0 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    user-select: none;
    cursor: pointer;
}

.home-input-area-box-editor-end-track-middle-right-model-select:hover {
    background-color: var(--ch-feature-card-bg);
}

.home-input-area-box-editor-end-track-middle-right-button {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.home-input-area-box-editor-end-track-middle-right-send-button {
    border-radius: 50%;
    background-color: var(--ch-main-color);
    opacity: 0.5;
    cursor: not-allowed;
}

.home-input-area-box-editor-end-track-middle-right-send-button:hover {
    background-color: var(--ch-main-hover-color);
}

.home-input-area-box-editor-end-track-middle-right-send-button.active {
    opacity: 1;
    cursor: pointer;
}

.home-input-area-box-editor-end-track-bottom {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 34px;
    user-select: none;
}

.home-input-area-box-editor-end-track-bottom-left {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.home-input-area-box-editor-end-track-bottom-middle {
    flex: 1;
    text-align: center;
}

.home-input-area-box-editor-end-track-bottom-right {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.home-input-area-tip {
    max-width: 100%;
    color: var(--ch-text-color-2);
    user-select: none;
    padding: 6px 0;
    font-size: 11px;
    line-height: 16px;
}
</style>