<template>
  <div class="home">
    <div class="home-container" :class="{ 'home-container-empty': sessionStore.currentSession.messages.length === 0 }">
      <section v-for="item in sessionStore.currentSession.messages" :key="item.id"
        :class="`home-container-${item.role}-message`">
        <details v-if="item.role === 'assistant' && item.reasoning && item.reasoning.length > 0"
          class="home-container-assistant-message-thinking"
          :open="item.reasoning.length > 0 && item.content.length === 0 && item.isStreaming">
          <summary class="home-container-assistant-message-thinking-summary">
            <span>思考过程</span>
            <svg class="home-container-assistant-message-thinking-summary-open" width="20" height="20"
              viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 30L25 18L37 30" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <svg class="home-container-assistant-message-thinking-summary-close" width="20" height="20"
              viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M36 18L24 30L12 18" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </summary>
          <div class="home-container-assistant-message-thinking-content">
            <!-- <MarkdownRender :custom-id="item.role + '-chat'" :content="item.reasoning"
                            :typewriter="item.isStreaming" :smooth-streaming="item.isStreaming"
                            :final="item.isStreaming" :max-live-nodes="item.isStreaming ? 320 : 0"
                            :fade="!item.isStreaming" mode="chat" :code-block-monaco-options="{
                                themes: ['vitesse-light'],
                                theme: 'vitesse-light',
                                MAX_HEIGHT: 640,
                            }" :code-block-props="{
                                stream: item.isStreaming,
                                showTooltips: false,
                                showExpandButton: false,
                                showCollapseButton: false,
                                showFontSizeButtons: false,
                                showPreviewButton: false,
                            }" :custom-markdown-it="customMarkdownIt">
                        </MarkdownRender> -->
            <MarkdownRenderer :content="item.reasoning"></MarkdownRenderer>
          </div>
        </details>
        <div v-if="item.role === 'user'" class="home-container-user-message-content">
          {{ item.content }}
        </div>
        <MarkdownRenderer v-else :content="item.content"></MarkdownRenderer>
        <!-- 错误消息 -->
        <div class="home-container-error-message" v-if="item.error !== undefined">
          <span>{{ item.error }}</span>
        </div>
        <!-- 状态功能栏 -->
        <div :class="[`home-container-${item.role}-status-bar`]" v-if="!item.isStreaming && !sessionStore.isReplying">
          <!-- 复制 -->
          <svg class="home-container-status-bar-button" width="20" height="20" viewBox="0 0 48 48" fill="none"
            xmlns="http://www.w3.org/2000/svg" @click="handleCopyTextClick(item.content)">
            <path
              d="M13 12.4316V7.8125C13 6.2592 14.2592 5 15.8125 5H40.1875C41.7408 5 43 6.2592 43 7.8125V32.1875C43 33.7408 41.7408 35 40.1875 35H35.5163"
              stroke="#81858c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <path
              d="M32.1875 13H7.8125C6.2592 13 5 14.2592 5 15.8125V40.1875C5 41.7408 6.2592 43 7.8125 43H32.1875C33.7408 43 35 41.7408 35 40.1875V15.8125C35 14.2592 33.7408 13 32.1875 13Z"
              fill="none" stroke="#81858c" stroke-width="4" stroke-linejoin="round" />
          </svg>
          <!-- 分享 -->
          <svg v-if="item.role === 'assistant'" class="home-container-status-bar-button" width="20" height="20"
            viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26 4L44 22L26 39V28C12 28 6 43 6 43C6 26 11 15 26 15V4Z" fill="none" stroke="#3c3c43"
              stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <!-- 重新生成 -->
          <svg v-if="item.role === 'assistant'" class="home-container-status-bar-button" width="20" height="20"
            viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M36.7279 36.7279C33.4706 39.9853 28.9706 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C28.9706 6 33.4706 8.01472 36.7279 11.2721C38.3859 12.9301 42 17 42 17"
              stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M42 8V17H33" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <!-- token数据 -->
          <div v-if="item.role === 'assistant'" class="home-container-status-bar-token">
            <!-- 提示词token -->
            <div v-if="item.promptTokens && item.promptTokens > 0" class="home-container-status-bar-token-item"
              data-tooltip="提示词token">
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M40 20C40 26.8077 35.7484 32.6224 29.7555 34.9336H24H18.2445C12.2516 32.6224 8 26.8077 8 20C8 11.1634 15.1634 4 24 4C32.8366 4 40 11.1634 40 20Z"
                  fill="none" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M29.7557 34.9336L29.0766 43.0831C29.0334 43.6014 28.6001 44 28.08 44H19.9203C19.4002 44 18.9669 43.6014 18.9238 43.0831L18.2446 34.9336"
                  stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M18 17V23L24 20L30 23V17" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <span>{{ item.promptTokens }}</span>
            </div>
            <!-- 回答token -->
            <div v-if="item.completionTokens && item.completionTokens > 0" class="home-container-status-bar-token-item"
              data-tooltip="回答token">
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.5 36H21L11 41V36H4V6H44V17" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M12 14H15L18 14" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M12 20H18L24 20" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M29 30L35 35L44 24" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <span>{{ item.completionTokens }}</span>
            </div>
            <!-- 总token -->
            <div v-if="item.totalTokens && item.totalTokens > 0" class="home-container-status-bar-token-item"
              data-tooltip="总token">
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 24L15.25 25.25M44 14L24 34L22.75 32.75" stroke="#3c3c43" stroke-width="4"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 24L14 34L34 14" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <span>{{ item.totalTokens }}</span>
            </div>
            <!-- 缓存命中token -->
            <div v-if="item.cachedTokens && item.cachedTokens > 0" class="home-container-status-bar-token-item"
              data-tooltip="缓存命中token">
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M44 31C44 36.5228 39.5228 41 34 41C32.2091 41 30.5281 40.5292 29.0741 39.7046C26.5143 38.2529 24.6579 35.7046 24.1436 32.6983C24.0492 32.1463 24 31.5789 24 31C24 28.4323 24.9678 26.0906 26.5585 24.3198C28.3892 22.2818 31.0449 21 34 21C39.5228 21 44 25.4772 44 31Z"
                  fill="none" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M34 12V20V21C31.0449 21 28.3892 22.2818 26.5585 24.3198C24.9678 26.0906 24 28.4323 24 31C24 31.5789 24.0492 32.1463 24.1436 32.6983C24.6579 35.7046 26.5143 38.2529 29.0741 39.7046C26.4116 40.5096 22.8776 41 19 41C10.7157 41 4 38.7614 4 36V28V20V12"
                  stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M34 12C34 14.7614 27.2843 17 19 17C10.7157 17 4 14.7614 4 12C4 9.23858 10.7157 7 19 7C27.2843 7 34 9.23858 34 12Z"
                  fill="none" stroke="#3c3c43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 28C4 30.7614 10.7157 33 19 33C20.807 33 22.5393 32.8935 24.1436 32.6983" stroke="#3c3c43"
                  stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 20C4 22.7614 10.7157 25 19 25C21.7563 25 24.339 24.7522 26.5585 24.3198" stroke="#3c3c43"
                  stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M34 26L31 30L37 32L34 36" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <span>{{ item.cachedTokens }}</span>
            </div>
          </div>
        </div>
      </section>
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
          <div class="home-input-area-box-editor-wrapper" :data-message="editorMessage">
            <textarea class="home-input-area-box-editor-wrapper-textarea" v-model="editorMessage"
              placeholder="聊点什么？shift+enter换行" spellcheck="false" autocomplete="off" autocapitalize="off"
              enterkeyhint="send" @keydown="handleEditorKeydown"></textarea>
          </div>
          <!-- 功能区域 -->
          <div class="home-input-area-box-editor-end">
            <!-- 左侧 -->
            <div class="home-input-area-box-editor-end-left">
              <div class="home-input-area-box-editor-end-left-button">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24.0605 10L24.0239 38" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M10 24L38 24" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <!-- 打开语音通话页面 -->
              <div class="home-input-area-box-editor-end-left-button" @click="openVoiceCallClick">
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
            <div class="home-input-area-box-editor-end-right">
              <!-- 模型选择 -->
              <div class="home-input-area-box-editor-end-right-model-select"></div>
              <!-- 语音识别按钮 -->
              <div class="home-input-area-box-editor-end-right-button">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="17" y="4" width="14" height="27" rx="7" fill="none" stroke="#3c3c43" stroke-width="4"
                    stroke-linejoin="round" />
                  <path d="M9 23C9 31.2843 15.7157 38 24 38C32.2843 38 39 31.2843 39 23" stroke="#3c3c43"
                    stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M24 38V44" stroke="#3c3c43" stroke-width="4" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <!-- 发送暂停按钮 -->
              <a class="home-input-area-box-editor-end-right-button home-input-area-box-editor-end-right-send-button"
                :class="{ active: isSendButtonActive }" @click="sendClick">
                <svg v-if="sessionStore.isReplying" width="20" height="20" viewBox="0 0 48 48" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M34 12H14C12.8954 12 12 12.8954 12 14V34C12 35.1046 12.8954 36 14 36H34C35.1046 36 36 35.1046 36 34V14C36 12.8954 35.1046 12 34 12Z"
                    fill="#ffffff" stroke="#ffffff" stroke-width="4" />
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24.0083 12.1006V36.0001" stroke="#ffffff" stroke-width="4" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M12 24L24 12L36 24" stroke="#ffffff" stroke-width="4" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </a>
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
    <Transition name="voice-call">
      <div v-if="showVoiceCall" class="home-voice-call">
        <button class="home-voice-call-button-close" @click="closeVoiceCallClick">
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8L40 40" stroke="#1b1b1f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 40L40 8" stroke="#1b1b1f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <Orb :state="voiceCallState" :volume="volume" theme="bars" :size="240" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts" name="home">
import { ref, computed, shallowRef, nextTick, inject } from "vue";
import { aiChatSse, getSessionTitleRequest, getGerundIndicator } from "@/request";
import { useSessionStore, useUserStore } from "@/stores";
import { copyTextToClipboard, pickDirectory } from "@/utils";
import { useToast } from "@/composables";
import MarkdownRenderer from "@/components/renderer/MarkdownRenderer.vue";
import RotatingText from "@/component/RotatingText/RotatingText.vue";
import { Orb, useAudioVolume } from 'orb-ui';
import type { OrbState } from 'orb-ui';

// 提示框
const toast = useToast();
// 会话store
const sessionStore = useSessionStore();
// 用户store
const userStore = useUserStore();
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
// 语音通话状态
const voiceCallState = ref<OrbState>('listening');
// 语音通话音量
const { volume, startMic, stop } = useAudioVolume()

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
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
async function handleCopyTextClick(text: string) {
  copyTextToClipboard(text).then((res) => {
    if (res) {
      toast.success("已复制");
    }
  });
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
    { id: Date.now(), role: "user", content: message, isStreaming: false },
    { id: Date.now() + 1, role: "assistant", content: "", isStreaming: true },
  );

  const assistantIndex = sessionStore.currentSession.messages.length - 1;
  const assistant = sessionStore.getMessageInCurrentSession(assistantIndex);

  sessionStore.isReplying = true;

  // 获取动词指示器
  getGerundIndicator(message).then((res) => {
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

.home-container-assistant-status-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
}

.home-container-user-status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.home-container-replying {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-container-replying-image {
  width: 20px;
  height: 20px;
}

.home-container-status-bar-button,
.home-container-status-bar-button path {
  cursor: pointer;
  stroke: var(--ch-text-color-2);
}

.home-container-status-bar-button:hover path {
  stroke: var(--ch-text-color-1);
}

.home-container-status-bar-token {
  display: flex;
  align-items: center;
  gap: 16px;
}

.home-container-status-bar-token-item,
.home-container-status-bar-token-item path {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  stroke: var(--ch-text-color-2);
  color: var(--ch-text-color-2);
}

.home-container-status-bar-token-item[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 4px 10px;
  font-size: 12px;
  line-height: 18px;
  color: var(--ch-white-bg-black);
  white-space: nowrap;
  background: var(--ch-black-bg-white);
  border-radius: 6px;
  pointer-events: none;
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.home-container-status-bar-token-item[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.home-container-status-bar-token-item:hover,
.home-container-status-bar-token-item:hover path {
  stroke: var(--ch-text-color-1);
  color: var(--ch-text-color-1);
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

.home-container-user-message {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
}

.home-container-user-message-content {
  max-width: 85%;
  background-color: var(--ch-feature-card-bg);
  border-radius: 12px 2px 12px 12px;
  font-size: 16px;
  padding: 8px 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.home-container-assistant-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
}

.home-container-assistant-message-thinking {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.home-container-assistant-message-thinking-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  list-style: none;
  user-select: none;
  cursor: pointer;
}

.home-container-assistant-message-thinking-summary-close {
  display: flex;
}

.home-container-assistant-message-thinking[open] .home-container-assistant-message-thinking-summary-close {
  display: none;
}

.home-container-assistant-message-thinking-summary-open {
  display: none;
}

.home-container-assistant-message-thinking[open] .home-container-assistant-message-thinking-summary-open {
  display: flex;
}

.home-container-assistant-message-thinking-summary::marker {
  display: none;
}

.home-container-assistant-message-thinking-content {
  color: hsl(0 0% 43%);
  border-left: 2.14286px solid var(--ch-line-color);
  padding-left: 12.85714px;
  margin-top: 12px;
}

.home-container-error-message {
  width: 100%;
  background-color: var(--ch-tip-error-bg-color);
  color: var(--ch-text-color-4);
  border: 1px solid var(--ch-tip-error-color);
  border-radius: 5px;
  padding: 8px 12px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-input-area-box-editor-end-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.home-input-area-box-editor-end-left-button {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.home-input-area-box-editor-end-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.home-input-area-box-editor-end-right-button {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.home-input-area-box-editor-end-right-send-button {
  border-radius: 50%;
  background-color: var(--ch-main-color);
  opacity: 0.5;
  cursor: not-allowed;
}

.home-input-area-box-editor-end-right-send-button:hover {
  background-color: var(--ch-main-hover-color);
}

.home-input-area-box-editor-end-right-send-button.active {
  opacity: 1;
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

.voice-call-enter-active,
.voice-call-leave-active {
  transition: transform 0.3s ease;
}

.voice-call-enter-from,
.voice-call-leave-to {
  transform: translateY(100%);
}

.home-voice-call {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--ch-bg-color-card);
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-voice-call-button-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
</style>
