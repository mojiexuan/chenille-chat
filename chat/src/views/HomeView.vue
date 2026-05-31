<template>
    <div class="home">
        <div class="home-container">
            <div v-for="item in messageList" :key="item.id" :class="`home-container-${item.role}-message`">
                <MarkdownRender :custom-id="item.role + '-chat'" :content="item.content" :typewriter="item.isStreaming"
                    :smooth-streaming="item.isStreaming ? 'auto' : false" :final="item.isStreaming"
                    :max-live-nodes="item.isStreaming ? 0 : undefined" :fade="!item.isStreaming">
                </MarkdownRender>
            </div>
        </div>
        <div class="home-input-area">
            <div class="home-input-area-box">
                <div class="home-input-area-box-editor-wrapper" :data-message="editorMessage">
                    <textarea class="home-input-area-box-editor" v-model="editorMessage"
                        placeholder="聊点什么？shift+enter换行" spellcheck="false" autocomplete="off" autocapitalize="off"
                        enterkeyhint="send" @keydown="handleEditorKeydown" @input="handleEditorInput"></textarea>
                </div>
                <!-- 功能区域 -->
                <div class="home-input-area-box-editor-end">
                    <div class="home-input-area-box-editor-end-left"></div>
                    <div class="home-input-area-box-editor-end-right">
                        <a class="home-input-area-box-editor-end-right-send-button"
                            :class="{ 'active': isSendButtonActive }" @click="sendClick">
                            <svg width="20" height="20" viewBox="0 0 48 48" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24.0083 12.1006V36.0001" stroke="#ffffff" stroke-width="4"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M12 24L24 12L36 24" stroke="#ffffff" stroke-width="4" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
            <div class="home-input-area-tip">内容由AI生成，请仔细甄别</div>
        </div>
    </div>
</template>

<script setup lang="ts" name="home">
import { ref, shallowRef } from 'vue';
import { aiChatSse } from '@/request';
import type { Message } from '@/types';
import MarkdownRender from 'markstream-vue';
import { useSessionStore } from '@/stores';

// 会话store
const sessionStore = useSessionStore();
// 编辑器消息
const editorMessage = ref('');
// 发送按钮是否激活
const isSendButtonActive = ref(false);
// 消息列表
const messageList = ref<Message[]>([]);
// 当前请求控制器
const abortController = shallowRef<AbortController | null>(null);
// 是否正在回复
const isReplying = ref(false);

/**
 * 编辑器键盘事件处理
 */
function handleEditorKeydown(e: KeyboardEvent) {
    if (e.shiftKey && e.key === 'Enter') {
        return;
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        sendClick();
    }
}

/**
 * 编辑器内容事件处理
 */
function handleEditorInput() {
    isSendButtonActive.value = editorMessage.value.trim().length > 0;
}

/**
 * 发送按钮点击事件处理
 */
function sendClick() {
    if (!isSendButtonActive.value) {
        return;
    }
    const message = editorMessage.value.trim();
    editorMessage.value = '';

    messageList.value.push(
        { id: Date.now(), role: 'user', content: message, isStreaming: false },
        { id: Date.now() + 1, role: 'assistant', content: '', isStreaming: true },
    );

    const assistantIndex = messageList.value.length - 1;
    const assistant = messageList.value[assistantIndex];

    isReplying.value = true;

    abortController.value = aiChatSse(
        sessionStore.currentSession.id,
        message,
        (msg) => {
            if (msg.error) {
                return;
            }

            if (msg.content) {
                if (!assistant) {
                    return;
                }
                assistant.content += msg.content;
            }

            if (msg.finished) {
                isReplying.value = false;
                if (!assistant) {
                    return;
                }
                assistant.isStreaming = false;
            }
        },
        (param) => {
            sessionStore.updateCurrentSessionId(param.sessionId);
            sessionStore.updateCurrentSessionTitle(param.title || '新会话');
        })
}
</script>

<style scoped>
.home {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.home-container {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.home-container-user-message {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
}

[data-custom-id="user-chat"] {
    max-width: 85%;
    background-color: var(--ch-feature-card-bg);
    border-radius: 12px 2px 12px 12px;
    font-size: 16px;
    padding: 8px 12px;
}

.home-container-assistant-message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
}

.home-input-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.home-input-area-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    background-color: var(--ch-bg-color-card);
    box-shadow: var(--ch-box-shadow-2);
    border-radius: 10px;
    border: 1px solid var(--ch-border-card-color);
    padding: 16px 16px 10px 16px;
}

.home-input-area-box-editor-wrapper {
    display: grid;
    max-height: 132px;
    overflow: hidden;
}

.home-input-area-box-editor-wrapper::after {
    content: attr(data-message) ' ';
    white-space: pre-wrap;
    word-break: break-word;
    visibility: hidden;
    grid-area: 1 / 1;
    font: inherit;
}

.home-input-area-box-editor-wrapper::after,
.home-input-area-box-editor {
    font-size: 14px;
    line-height: 22px;
}

.home-input-area-box-editor {
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
}

.home-input-area-box-editor-end-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.home-input-area-box-editor-end-right-send-button {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background-color: var(--ch-main-color);
    opacity: 0.5;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: not-allowed;
}

.home-input-area-box-editor-end-right-send-button:hover {
    background-color: var(--ch-main-hover-color);
}

.home-input-area-box-editor-end-right-send-button.active {
    opacity: 1;
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