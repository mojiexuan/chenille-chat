<template>
  <div class="home">
    <div class="home-container" :class="{ 'home-container-empty': sessionStore.currentSession.messages.length === 0 }">
      <!-- 消息列表 -->
      <MessageItem />
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
    <div class="home-input-area">
      <div class="home-input-area-box">
        <div class="home-input-area-box-editor">
          <div class="home-input-area-box-editor-wrapper" :class="{ 'speech-active': showSpeechRecognition }"
            :data-message="editorMessage">
            <SpeechWaveform v-if="showSpeechRecognition" :volume="microphoneVolume" :height="44" />
            <textarea v-else class="home-input-area-box-editor-wrapper-textarea" v-model="editorMessage"
              placeholder="聊点什么？shift+enter换行" spellcheck="false" autocomplete="off" autocapitalize="off"
              enterkeyhint="send" @keydown="handleEditorKeydown"></textarea>
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
                  <div class="home-input-area-box-editor-end-track-middle-left-button" @click="fileSelectClick">
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M24.7073 9.56521L9.85801 24.4145C6.34329 27.9292 6.34329 33.6277 9.85801 37.1424V37.1424C13.3727 40.6571 19.0712 40.6571 22.5859 37.1424L40.2636 19.4647C42.6067 17.1216 42.6067 13.3226 40.2636 10.9794V10.9794C37.9205 8.63628 34.1215 8.63628 31.7783 10.9794L14.1007 28.6571C12.9291 29.8287 12.9291 31.7282 14.1007 32.8997V32.8997C15.2722 34.0713 17.1717 34.0713 18.3433 32.8997L33.1925 18.0505"
                        stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                  <!-- 图片上传 -->
                  <div class="home-input-area-box-editor-end-track-middle-left-button">
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M44 24C44 22.8954 43.1046 22 42 22C40.8954 22 40 22.8954 40 24H44ZM24 8C25.1046 8 26 7.10457 26 6C26 4.89543 25.1046 4 24 4V8ZM39 40H9V44H39V40ZM8 39V9H4V39H8ZM40 24V39H44V24H40ZM9 8H24V4H9V8ZM9 40C8.44772 40 8 39.5523 8 39H4C4 41.7614 6.23857 44 9 44V40ZM39 44C41.7614 44 44 41.7614 44 39H40C40 39.5523 39.5523 40 39 40V44ZM8 9C8 8.44772 8.44771 8 9 8V4C6.23858 4 4 6.23857 4 9H8Z"
                        fill="#3c3c43" />
                      <path d="M6 35L16.6931 25.198C17.4389 24.5143 18.5779 24.4953 19.3461 25.1538L32 36"
                        stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M28 31L32.7735 26.2265C33.4772 25.5228 34.5914 25.4436 35.3877 26.0408L42 31"
                        stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M37 18L37 6" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path d="M32 11L37 6L42 11" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                  <!-- 打开语音通话页面 -->
                  <div class="home-input-area-box-editor-end-track-middle-left-button" @click="openVoiceCallClick">
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 3.99976V43.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
                      <path d="M34 11.9998V35.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
                      <path d="M4 17.9998V29.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
                      <path d="M44 17.9998V29.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
                      <path d="M14 11.9998V35.9998" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>
                <!-- 右侧 -->
                <div class="home-input-area-box-editor-end-track-middle-right">
                  <!-- 模型选择 -->
                  <div class="home-input-area-box-editor-end-track-middle-right-model-select"
                    @click="openModelSelectMenuClick">
                    <span>{{ modelStore.currentModel?.name || "Auto" }}</span>
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M36 18L24 30L12 18" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                  <!-- 语音识别按钮 -->
                  <div class="home-input-area-box-editor-end-track-middle-right-button"
                    @click="toggleSpeechRecognitionClick">
                    <img v-if="speechRecognitionLoading" width="20" height="20" src="../assets/images/loading.svg"
                      alt="语音识别中">
                    <svg v-else width="20" height="20" viewBox="0 0 48 48" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <rect x="17" y="4" width="14" height="27" rx="7" fill="none" stroke="#3c3c43" stroke-width="4"
                        stroke-linejoin="round" />
                      <path d="M9 23C9 31.2843 15.7157 38 24 38C32.2843 38 39 31.2843 39 23" stroke="#3c3c43"
                        stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M24 38V44" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                  <!-- 发送暂停按钮 -->
                  <a class="home-input-area-box-editor-end-track-middle-right-button home-input-area-box-editor-end-track-middle-right-send-button"
                    :class="{ active: isSendButtonActive }" @click="sendClick">
                    <svg v-if="sessionStore.isReplying" width="20" height="20" viewBox="0 0 48 48" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M34 12H14C12.8954 12 12 12.8954 12 14V34C12 35.1046 12.8954 36 14 36H34C35.1046 36 36 35.1046 36 34V14C36 12.8954 35.1046 12 34 12Z"
                        fill="#ffffff" stroke="#ffffff" stroke-width="4" />
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 48 48" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M24.0083 12.1006V36.0001" stroke="#ffffff" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path d="M12 24L24 12L36 24" stroke="#ffffff" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
              <!-- 下 -->
              <div class="home-input-area-box-editor-end-track-bottom">
                <!-- 左侧 -->
                <div class="home-input-area-box-editor-end-track-bottom-left" @click="cancelSpeechRecognitionClick">
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <div class="home-input-area-box-editor-end-track-bottom-right" @click="submitSpeechRecognitionClick">
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 24L20 34L40 14" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 工作区操作 -->
        <div v-if="isSupportDirectoryPicker" class="home-input-area-box-work">
          <div class="home-input-area-box-work-left">
            <div class="home-input-area-box-work-left-item" @click="selectDirectoryClick">
              <!-- 选择文件夹图标 -->
              <svg v-if="sessionStore.isCurrentSessionWorkSpaceStatus === 'none'" width="18" height="18"
                viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 8C5 6.89543 5.89543 6 7 6H19L24 12H41C42.1046 12 43 12.8954 43 14V40C43 41.1046 42.1046 42 41 42H7C5.89543 42 5 41.1046 5 40V8Z"
                  fill="none" stroke="#3c3c43" stroke-width="4" stroke-linejoin="round" />
                <path d="M18 27H30" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
                <path d="M24 21L24 33" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" />
              </svg>
              <!-- 文件夹异常 -->
              <svg v-if="sessionStore.isCurrentSessionWorkSpaceStatus === 'error'" width="20" height="20"
                viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M43 23V14C43 12.8954 42.1046 12 41 12H24L19 6H7C5.89543 6 5 6.89543 5 8V40C5 41.1046 5.89543 42 7 42H22"
                  stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M30 30L40 40" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M40 30L30 40" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <!-- 文件夹准备好 -->
              <svg v-if="sessionStore.isCurrentSessionWorkSpaceStatus === 'ready'" width="18" height="18"
                viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </div>
      <div class="home-input-area-tip">内容由AI生成，请仔细甄别</div>
    </div>
    <!-- AI语音通话 -->
    <VoiceCall :show="showVoiceCall" @update:show="closeVoiceCallClick" />
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

<script setup lang="ts" name="home">
import { ref, computed, shallowRef, nextTick, inject, watch, onUnmounted } from "vue";
import { aiChatSse, getSessionTitleRequest, getGerundIndicatorRequest, asrRecognizeRequest } from "@/request";
import { useSessionStore, useUserStore, useModelStore } from "@/stores";
import { pickDirectory } from "@/utils";
import MessageItem from "@/components/home/MessageItem.vue";
import RotatingText from "@/component/RotatingText/RotatingText.vue";
import VoiceCall from "@/components/home/VoiceCall.vue";
import ContextMenu from '@/components/menu/ContextMenu.vue';
import SpeechWaveform from "@/components/home/SpeechWaveform.vue";
import { AI_CHAT_ACCEPTED_FILE_TYPES } from "@/constants";
import { useMicrophoneVolume } from "@/composables";

// 会话store
const sessionStore = useSessionStore();
// 用户store
const userStore = useUserStore();
// 模型store
const modelStore = useModelStore();
// 编辑器消息
const editorMessage = ref("");
// 发送按钮是否激活
const isSendButtonActive = computed(() => editorMessage.value.trim().length > 0);
// 当前请求控制器
const abortController = shallowRef<AbortController | null>(null);
// 滚动到内容区域底部的方法
const scrollMainToBottom = inject<(force?: boolean) => void>("scrollMainToBottom", () => { });
// 是否支持文件夹选择
// const isSupportDirectoryPicker = ref(window.showDirectoryPicker !== void 0);
// !TODO: 临时关闭文件夹选择功能
const isSupportDirectoryPicker = ref(false);
// 是否显示语音通话
const showVoiceCall = ref(false);
// 是否显示模型选择菜单
const modelSelectMenuVisible = ref(false);
// 模型选择菜单锚点
const modelSelectMenuAnchor = ref({ x: 0, y: 0 });
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
 * 发送按钮点击事件处理
 */
function sendClick() {
  if (!isSendButtonActive.value) {
    return;
  }
  // 如果正在回复，直接取消请求
  if (sessionStore.isReplying) {
    abortController.value?.abort();
    sessionStore.isReplying = false;
    return;
  }
  const message = editorMessage.value.trim();
  editorMessage.value = "";

  sessionStore.addCurrentSessionMessage(
    { id: Date.now().toString(), role: "user", content: message, isStreaming: false },
    { id: (Date.now() + 1).toString(), role: "assistant", content: "", isStreaming: true },
  );

  const assistantIndex = sessionStore.currentSession.messages.length - 1;
  const assistant = sessionStore.getMessageInCurrentSession(assistantIndex);

  sessionStore.isReplying = true;

  // 获取动词指示器
  getGerundIndicatorRequest(message).then((res) => {
    if (res && res.length > 0) {
      sessionStore.gerundIndicator
    }
  });

  // 发起请求
  abortController.value = aiChatSse(
    sessionStore.currentSession.id,
    {
      message,
      ...(sessionStore.isCurrentSessionWorkSpaceStatus === "ready" ? { workSpace: sessionStore.currentSession.workSpace } : {}),
      modelId: modelStore.currentModel?.id || void 0,
    },
    (msg) => {
      if (msg.error) {
        if (assistant) {
          assistant.error = msg.error;
          assistant.isStreaming = false;
        }
        abortController.value?.abort(msg.error);
        return;
      }

      if (sessionStore.currentSession.id !== msg.sessionId && msg.sessionId) {
        sessionStore.updateCurrentSessionId(msg.sessionId);
      }

      // 有推理内容
      if (msg.reasoning && msg.reasoning.length > 0) {
        if (assistant) {
          if (!assistant.reasoning) {
            assistant.reasoning = "";
          }
          assistant.reasoning += msg.reasoning;
          nextTick(() => scrollMainToBottom());
        }
      }

      // 有内容
      if (msg.content && msg.content.length > 0) {
        if (assistant) {
          assistant.content += msg.content;
          nextTick(() => scrollMainToBottom());
        }
      }

      if (msg.usage) {
        if (assistant) {
          assistant.promptTokens = msg.usage.prompt_tokens || 0;
          assistant.completionTokens = msg.usage.completion_tokens || 0;
          assistant.totalTokens = msg.usage.total_tokens || 0;
          assistant.cachedTokens = msg.usage.prompt_tokens_details?.cached_tokens || 0;
        }
      }

      if (msg.finished) {
        sessionStore.isReplying = false;
        if (sessionStore.currentSession.title === "新会话" && sessionStore.currentSession.id) {
          getSessionTitleRequest(sessionStore.currentSession.id).then((title) => {
            sessionStore.updateCurrentSessionTitle(title);
          });
        }
        if (assistant) {
          assistant.isStreaming = false;
        }
        abortController.value?.abort();
        return;
      }
    },
    () => {
      // 请求完成
      if (sessionStore.isReplying) {
        sessionStore.isReplying = false;
      }
      abortController.value?.abort();
    },
    () => {
      // 请求错误
      if (sessionStore.isReplying) {
        sessionStore.isReplying = false;
      }
      abortController.value?.abort();
    },
  );
}

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

/**
 * 文件选择
 */
function fileSelectClick() {
  const input =
    document.createElement("input");
  input.type = "file";
  input.accept = AI_CHAT_ACCEPTED_FILE_TYPES.join(",");
  input.multiple = true;
  input.onchange = () => {
    const files =
      Array.from(input.files ?? []);
  }
  input.click();
}

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

/**
 * 打开模型选择菜单
 */
function openModelSelectMenuClick(e: MouseEvent) {
  modelSelectMenuAnchor.value = { x: e.clientX, y: e.clientY };
  modelSelectMenuVisible.value = !modelSelectMenuVisible.value;
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
        editorMessage.value += result;
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

/**
 * 切换模型
 */
function switchModelClick(modelId: string) {
  modelStore.switchModel(modelId);
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

.home-input-area-tip {
  max-width: 100%;
  color: var(--ch-text-color-2);
  user-select: none;
  padding: 6px 0;
  font-size: 11px;
  line-height: 16px;
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
